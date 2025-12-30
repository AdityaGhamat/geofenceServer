import { Request, Response, NextFunction } from "express";
import UserModel from "./document/auth.document";
import jwt from "jsonwebtoken";
import {
  createUserSchema,
  loginSchema,
  updateLocationSchema,
} from "./validation-schema";
import client from "../attendance/config/redis.config";
import OfficeModel from "../office/document/office.document";
import { Types } from "mongoose";
import { sendZodError } from "../core/errors/zodError.errors";
class AuthController {
  public async CreateUser(req: Request, res: Response) {
    const userBody = createUserSchema.safeParse(req.body);
    if (!userBody.success) {
      return sendZodError(res, userBody.error);
    }
    const user = new UserModel(userBody.data);
    if (!user) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Failed to create user",
        },
      });
    }
    const emailCheck = await UserModel.findOne({ email: userBody.data?.email });
    if (emailCheck) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Email is already created, please login to continue",
        },
      });
    }
    await user.save();
    const cookie = jwt.sign(
      { user_id: user!._id, email: user!.email },
      process.env.COOKIE_SECRET_KEY as string,
      { expiresIn: "15m" }
    );
    const resData = {
      id: user._id,
      name: user.name,
      email: user.email,
      office: user.office,
      role: user.role,
      authorization: cookie,
    };
    res
      .status(200)
      .cookie("Authorization", cookie, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({
        success: true,
        active: true,
        data: resData,
        message: "",
        error: {},
      });
  }
  public async SignIn(req: Request, res: Response) {
    const userBody = loginSchema.safeParse(req.body);
    if (!userBody.success) {
      return sendZodError(res, userBody.error);
    }
    const emailCheck = await UserModel.findOne({ email: userBody.data?.email });
    if (!emailCheck) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Email not found",
        },
      });
    }
    const passwordCheck = await emailCheck?.comparePassword(
      userBody.data?.password!
    );
    if (!passwordCheck) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message:
            passwordCheck == undefined
              ? "Password is not found"
              : "Password is incorrect",
        },
      });
    }
    const cookie = jwt.sign(
      { user_id: emailCheck!._id, email: emailCheck!.email },
      process.env.COOKIE_SECRET_KEY as string,
      { expiresIn: "15m" }
    );
    res
      .status(200)
      .cookie("Authorization", cookie, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({
        success: true,
        active: true,
        data: {
          id: emailCheck!._id,
          name: emailCheck!.name,
          email: emailCheck!.email,
          office: emailCheck!.office,
          role: emailCheck!.role,
          authorization: cookie,
        },
        message: "",
        error: {},
      });
  }

  //use auth middleware
  public async logOut(req: Request, res: Response) {
    const { user_id } = req.user;
    const userCheck = await UserModel.findById(user_id);
    if (!userCheck) {
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
    res
      .clearCookie("Authorization")
      .status(200)
      .json({
        success: true,
        active: true,
        data: {
          name: userCheck!.name,
        },
        message: "User has been logged out",
        error: {},
      });
  }

  //use auth middleware here
  public async getLocation(req: Request, res: Response) {
    const { user_id } = req.user;
    const userCheck = await UserModel.findById(user_id);
    if (!userCheck) {
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
    res.status(200).json({
      success: true,
      active: true,
      data: {
        name: userCheck.coordinates,
      },
      message: "Successfully fetched the location",
      error: {},
    });
  }

  //use auth middleawre here
  public async updateLocation(req: Request, res: Response) {
    const locationBody = updateLocationSchema.safeParse(req.body);
    if (!locationBody.success) {
      return sendZodError(res, locationBody.error);
    }
    const { user_id } = req.user;
    const userCheck = await UserModel.findById(user_id);
    if (!userCheck) {
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
    const { coordinates } = locationBody?.data!;
    const [lat, lang] = coordinates;
    const key = `location:${userCheck.office}:${userCheck._id}`;
    const updatedLocation = await client.set(
      key,
      JSON.stringify({
        latitude: lat,
        longitude: lang,
        timestamp: Date.now(),
      }),
      "EX",
      30 * 60
    );
    // const updatedUser = await UserModel.findByIdAndUpdate(user_id, {
    //   coordinates: locationBody.data?.coordinates,
    // });
    res.status(200).json({
      success: true,
      active: true,
      data: updatedLocation,
      message: "Successfully updated location",
      error: {},
    });
  }

  public async getProfileNoCache(req: Request, res: Response) {
    let user_id: any;
    if (!req.query.i) {
      user_id = req.user.user_id;
    } else {
      user_id = req.query.i;
    }
    const user = await UserModel.findById(user_id)
      .select(["name", "email", "role", "_id", "office"])
      .populate("office", "_id name isActive");

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
    res.status(200).json({
      success: true,
      active: true,
      data: user,
      message: "Successfully fetched profile",
      error: {},
    });
  }

  public async getProfile(req: Request, res: Response) {
    let user_id: any;
    if (!req.query.i) {
      user_id = req.user.user_id;
    } else {
      user_id = req.query.i;
    }
    const user = await client.get(`profile:${user_id}`);
    if (user) {
      return res.status(200).json({
        success: true,
        active: true,
        data: JSON.parse(user),
        message: "Successfully fetched profile",
        error: {},
      });
    } else {
      const userCheck = await UserModel.findById(user_id)
        .select(["name", "email", "role", "_id", "office"])
        .populate("office", "_id name isActive");
      if (!userCheck) {
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
      const key = `profile:${userCheck._id}`;
      await client.setex(key, 360, JSON.stringify(userCheck));
      res.status(200).json({
        success: true,
        active: true,
        data: userCheck,
        message: "Successfully fetched profile",
        error: {},
      });
    }
  }
  public async joinOffice(req: Request, res: Response) {
    const officeId = req.params.oi;
    if (!officeId) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "oi param not provided",
        },
      });
    }
    const userId = req.user.user_id;
    const user = await UserModel.findById(userId);
    if (user!.office) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "user is already joined office",
        },
      });
    }
    const office = await OfficeModel.findById(officeId);
    if (!office) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "office not found",
        },
      });
    }
    const userObjectId = new Types.ObjectId(userId);
    const officeObjectId = new Types.ObjectId(officeId);
    //updating user by putting office id in user
    await Promise.all([
      UserModel.updateOne({ _id: userObjectId }, { office: officeObjectId }),
      OfficeModel.updateOne(
        { _id: officeObjectId },
        { $addToSet: { workers: userObjectId } }
      ),
    ]);

    res.status(200).json({
      success: true,
      active: true,
      data: {},
      message: "Joined Office Successfully",
      error: {},
    });
  }

  public async leaveOffice(req: Request, res: Response) {
    //user
    const userId = req.user.user_id;
    const user = await UserModel.findById(userId);
    if (!user!.office) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "office not found",
        },
      });
    }
    //office
    const officeId = req.params.oi;
    if (!officeId) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "oi param not provided",
        },
      });
    }
    if (user!.office.toString() !== officeId) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "you are not part of this office",
        },
      });
    }

    const userObjectId = new Types.ObjectId(userId);
    const officeObjectId = new Types.ObjectId(officeId);

    await Promise.all([
      UserModel.updateOne({ _id: userObjectId }, { office: null }),
      OfficeModel.updateOne(
        { _id: officeObjectId },
        { $pull: { workers: userObjectId } }
      ),
    ]);
    res.status(200).json({
      success: true,
      active: true,
      data: {},
      message: "Leaved Office Successfully",
      error: {},
    });
  }
}

export default new AuthController();
