import { Request, Response } from "express";
import {
  changeActiveStatusSchema,
  updateAdminSchema,
  createOfficeSchema,
  updateLocationSchema,
  updateWorkingDaysSchema,
  updateWorkingTimeSchema,
  removeAdminSchema,
} from "./validation-schema";
import OfficeModel from "./document/office.document";
import UserModel from "../auth/document/auth.document";
import { Types } from "mongoose";
import { sendZodError } from "../core/errors/zodError.errors";
import client from "../attendance/config/redis.config";
class OfficeController {
  //authmiddleware & adminmiddlewar
  public async createOffice(req: Request, res: Response) {
    //request body
    const reqBody = createOfficeSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }
    //user id
    const admin = req.user.user_id;
    //fetching user by Admin
    const user = await UserModel.findById(admin);
    if (!user) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "User is not found",
        },
      });
    }
    if (user?.office) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "User is already in office",
        },
      });
    }
    const new_office = new OfficeModel(reqBody.data);

    new_office.office_admin.push(admin);

    new_office.workers.push(admin);

    await new_office.save();

    user!.office = new_office._id;

    user.role = "super_admin";

    await user!.save();

    await client.del(`profile:${user._id}`);

    res.status(202).json({
      success: true,
      active: true,
      data: new_office,
      message: "Create new office",
      error: {},
    });
  }

  //authmiddleware & adminmiddlewar
  public async updateLocation(req: Request, res: Response) {
    const reqBody = updateLocationSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }

    const adminId = req.user.user_id;
    const admin = await UserModel.findById(adminId);

    if (!admin || !admin.office) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message:
            "You must be assigned to an office to update its coordinates.",
        },
      });
    }

    const updatedOffice = await OfficeModel.findByIdAndUpdate(
      admin.office,
      {
        $set: { coordinates: reqBody.data.coordinates },
      },
      { new: true }
    );

    if (!updatedOffice) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Office not found.",
        },
      });
    }
    await client.del(`profile:${adminId}`);
    res.status(200).json({
      success: true,
      active: true,
      data: updatedOffice,
      message: "Office coordinates updated successfully",
      error: {},
    });
  }

  //authmiddelware and adminmiddleware
  public async changeWorkingDays(req: Request, res: Response) {
    const reqBody = updateWorkingDaysSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }
    const adminId = req.user.user_id;
    const admin = await UserModel.findById(adminId);
    const officeId = admin!.office;
    const updatedOffice = await OfficeModel.findByIdAndUpdate(
      officeId,
      {
        workingDays: reqBody.data?.workingDays,
      },
      { new: true }
    );
    if (!updatedOffice) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Failed to update working hours of office",
        },
      });
    }
    await client.del(`profile:${adminId}`);
    res.status(200).json({
      success: true,
      active: true,
      data: updatedOffice,
      message: "Updated working days of office",
      error: {},
    });
  }

  //authmiddleware & adminmiddleware
  public async changeWorkingTime(req: Request, res: Response) {
    const reqBody = updateWorkingTimeSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }
    const adminId = req.user.user_id;
    const admin = await UserModel.findById(adminId);
    const officeId = admin!.office;
    const updatedOffice = await OfficeModel.findByIdAndUpdate(
      officeId,
      {
        workStartTime: reqBody.data?.workStartTime,
        workEndTime: reqBody.data?.workEndTime,
      },
      { new: true }
    );
    if (!updatedOffice) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Failed to update working hours",
        },
      });
    }
    res.status(200).json({
      success: true,
      active: true,
      data: updatedOffice,
      message: "Updated working times of office",
      error: {},
    });
  }
  //authmiddleware & adminmiddleware
  public async changeActiveStatus(req: Request, res: Response) {
    const reqBody = changeActiveStatusSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }
    const adminId = req.user.user_id;
    const admin = await UserModel.findById(adminId);
    const officeId = admin!.office;
    const updatedOffice = await OfficeModel.findByIdAndUpdate(
      officeId,
      {
        isActive: reqBody.data?.isActive,
      },
      { new: true }
    );

    await client.del(`profile:${adminId}`);

    if (!updatedOffice) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Failed to update office status",
        },
      });
    }
    res.status(200).json({
      success: true,
      active: true,
      data: updatedOffice,
      message: "Updated working times of office",
      error: {},
    });
  }

  public async changeRadius(req: Request, res: Response) {
    const { rad } = req.query;
    console.log(`radius : ${rad}`);
    if (!rad) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Radius is not provided in query",
        },
      });
    }
    if (Number(rad) < 10 || Number(rad) > 100) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Radius is either less than 10 or greater than 100",
        },
      });
    }
    const { user_id } = req.user;
    const user = await UserModel.findById(user_id)
      .select(["_id", "office"])
      .lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "User not found",
        },
      });
    }
    const office = await OfficeModel.findById(user?.office);
    if (!office) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Office not found",
        },
      });
    }
    const updatedOffice = await OfficeModel.findByIdAndUpdate(
      office._id,
      {
        geofence_radius: Number(rad),
      },
      { new: true }
    ).select(["_id", "uid", "name", "geofence_radius"]);
    console.log(`updatedOffice : ${updatedOffice}`);
    await client.del(`profile:${user._id}`);
    res.status(200).json({
      success: true,
      active: true,
      data: updatedOffice,
      message: "Updated geofence radius of office",
      error: {},
    });
  }

  //authmiddleware and adminmiddleware/superadminmiddleware
  public async UpdateAdmin(req: Request, res: Response) {
    const reqBody = updateAdminSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }

    try {
      const office = await OfficeModel.findOne({
        _id: new Types.ObjectId(reqBody.data!.officeId),
        office_admin: { $in: [new Types.ObjectId(req.user.user_id)] },
        workers: {
          $in: [new Types.ObjectId(reqBody.data!.new_adminId)],
        },
        isActive: true,
      });
      console.log(office);
      if (!office) {
        return res.status(404).json({
          success: false,
          active: true,
          data: {},
          message: "",
          error: {
            message: "You are not working in office or Office does not found",
          },
        });
      }
      const new_admin = await UserModel.findById(reqBody.data?.new_adminId);
      if (
        !new_admin ||
        new_admin.role === "admin" ||
        new_admin.role === "super_admin"
      ) {
        return res.status(404).json({
          success: false,
          active: true,
          data: {},
          message: "",
          error: {
            message: "new admin not found or is already a admin",
          },
        });
      }
      await Promise.all([
        OfficeModel.findOneAndUpdate(
          { _id: office._id },
          {
            $addToSet: { office_admin: new_admin!._id },
          }
        ),
        UserModel.findByIdAndUpdate(new_admin._id, { role: "admin" }),
      ]);
      res.status(200).json({
        success: true,
        active: true,
        data: {},
        message: "Admin has been updated",
        error: {},
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: `Failed to update admin due to ${error.message}`,
          error: error,
        },
      });
    }
  }

  //authmiddleware and superadmin
  public async removeAdmin(req: Request, res: Response) {
    const reqBody = removeAdminSchema.safeParse(req.body);
    if (!reqBody.success) {
      return sendZodError(res, reqBody.error);
    }
    try {
      const office = await OfficeModel.findOne({
        _id: new Types.ObjectId(reqBody.data!.officeId),
        office_admin: { $in: [new Types.ObjectId(req.user.user_id)] },
        workers: {
          $in: [new Types.ObjectId(reqBody.data!.new_adminId)],
        },
        isActive: true,
      });
      if (!office) {
        return res.status(404).json({
          success: false,
          active: true,
          data: {},
          message: "",
          error: {
            message: "You are not working in office or Office does not found",
          },
        });
      }
      const new_admin = await UserModel.findById(reqBody.data.new_adminId);
      if (!new_admin) {
        return res.status(404).json({
          success: false,
          active: true,
          data: {},
          message: "",
          error: {
            message: "new admin not found or is already a admin",
          },
        });
      }
      await Promise.all([
        OfficeModel.findOneAndUpdate(
          {
            _id: office._id,
          },
          {
            $pull: { office_admin: new_admin._id },
          }
        ),
        UserModel.findByIdAndUpdate(new_admin._id, {
          role: "user",
        }),
      ]);
      res.status(200).json({
        success: true,
        active: true,
        data: {},
        message: "Admin has been updated",
        error: {},
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: `Failed to update admin due to ${error.message}`,
          error: error,
        },
      });
    }
  }
  //authmiddleware and adminmiddleware
  public async getOffice(req: Request, res: Response) {
    const userIdStr = req.user.user_id;
    const userId = new Types.ObjectId(userIdStr);
    const user = await UserModel.findById(userIdStr);
    const officeId = user!.office;
    const office = await OfficeModel.findById(officeId);
    if (!office) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "office not found",
        },
      });
    }
    const resBody = {
      name: office.name,
      coordinates: office.coordinates,
      isActive: office.isActive,
      workingDays: office.workingDays,
      workStartTime: office.workStartTime,
      workEndTime: office.workEndTime,
    };
    res.status(200).json({
      success: true,
      active: true,
      data: resBody,
      message: "Updated working times of office",
      error: {},
    });
  }

  //authmiddleware and adminmiddleware
  public async getWorkers(req: Request, res: Response) {
    const userId = req.user.user_id;
    const user = await UserModel.findById(userId);
    const officeId = user!.office;
    const office = await OfficeModel.findById(officeId)
      .select("workers")
      .populate({
        path: "workers",
        select: "name email role isActive",
      });
    if (!office) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Office not found",
        },
      });
    }
    res.status(200).json({
      success: true,
      active: true,
      data: office.workers,
      message: "Office workers are fetched",
      errors: {},
    });
  }

  //use auth middleware in this one too admin or office not required in this one so will not use
  public async searchOffices(req: Request, res: Response) {
    const { q, page = 1, limit = 10 } = req.query;
    const search = typeof q === "string" ? q : "";
    const searchTerm = search ? search.trim() : "";
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "query not provided",
        },
      });
    }
    const pageParsed = parseInt(page as string);
    const limitParsed = parseInt(limit as string);
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" }, isDeleted: false }
      : {};
    const skip = (pageParsed - 1) * limitParsed;
    const [offices, total] = await Promise.all([
      OfficeModel.find(query)
        .select(["name", "isActive", "workStartTime", "workEndTime"])
        .skip(skip)
        .limit(limitParsed),
      OfficeModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      active: true,
      data: {
        offices,
        total,
        page: pageParsed,
        limit: limitParsed,
      },
      message: "Office has been found",
      errors: {},
    });
  }
}

export default new OfficeController();
