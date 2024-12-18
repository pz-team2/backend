import { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
} from "../../controllers/userController";
import User from "../../models/User";
import apiResponse from "../../utils/apiResource";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import httpMocks from "node-mocks-http";
import mongoose from "mongoose";
import { Types } from "mongoose";

describe("User Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should get all users", async () => {
    const mockUsers = [
      { _id: "1", username: "user1", email: "user1@example.com" },
      { _id: "2", username: "user2", email: "user2@example.com" },
    ];

    sinon.stub(User, "find").resolves(mockUsers);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    const expectedResponse = {
      success: true,
      message: "Berhasil Mendapatkan Data User",
      code: 200,
      data: mockUsers,
    };

    await getUsers(req, res);

    const data = res._getJSONData();
    expect(data).toEqual(expectedResponse);
    expect(res.statusCode).toBe(200);
  });

  test("should get user by id", async () => {
    const req = httpMocks.createRequest({
      params: { id: "1" },
      user: { id: "1" },
    });
    const res = httpMocks.createResponse();

    const mockUser = { username: "user1", email: "user1@example.com" };

    sinon.stub(User, "findById").resolves(mockUser);

    await getUserById(req as Request, res as Response);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual(
      apiResponse(true, "Berhasil Mengambil Detail User", { user: mockUser })
    );
  });

  it("should update a user", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const req = httpMocks.createRequest({
      user: { id: userId },
      body: {
        username: "updatedUsername",
        email: "updatedEmail@example.com",
      },
    });

    const res = httpMocks.createResponse();

    const mockUser = {
      _id: userId,
      username: "oldUsername",
      email: "oldEmail@example.com",
      save: sinon.stub().resolves({}),
    };

    sinon.stub(User, "findById").resolves(mockUser);

    await updateUser(req as Request, res as Response);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);

    expect(data).toMatchObject(
      apiResponse(true, "successfully", {
        _id: userId,
        username: "updatedUsername",
        email: "updatedEmail@example.com",
      })
    );
  });

  test("should update password", async () => {
    const req = httpMocks.createRequest({
      user: { id: "1" },
      body: {
        password: "old_password",
        pwbaru: "new_password",
        confirmpw: "new_password",
      },
    });
    const res = httpMocks.createResponse();

    const mockUser = {
      password: await bcrypt.hash("old_password", 10),
      save: jest.fn().mockResolvedValue({}),
    };

    sinon.stub(User, "findById").resolves(mockUser);
    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(bcrypt, "hash").resolves("hashed_new_password");

    await updatePassword(req as Request, res as Response);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual(apiResponse(true, "Berhasil Update Password"));
  });
});
