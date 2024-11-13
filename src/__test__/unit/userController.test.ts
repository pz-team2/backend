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

describe("User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    sinon.restore();
  });

  test("should get all users", async () => {
    const mockUsers = [
      { username: "user1", email: "user1@example.com" },
      { username: "user2", email: "user2@example.com" },
    ];
    sinon.stub(User, "find").resolves(mockUsers);

    await getUsers(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil Mendapatkan Data User", { users: mockUsers })
    );
  });

  test("should get user by id", async () => {
    req.params = { id: "1" };
    const mockUser = { username: "user1", email: "user1@example.com" };
    sinon.stub(User, "findById").resolves(mockUser);

    await getUserById(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil Mengambil Detail User", { user: mockUser })
    );
  });

  test("should update a user", async () => {
    req.params = { id: "1" };
    req.body = {
      username: "user1_updated",
      email: "user1_updated@example.com",
    };
    const mockUser = {
      username: "user1",
      email: "user1@example.com",
      save: jest.fn().mockResolvedValue({}),
    };
    sinon.stub(User, "findById").resolves(mockUser);

    await updateUser(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(false, "successfully", { user: mockUser })
    );
  });

  test("should update password", async () => {
    req.body = {
      password: "old_password",
      pwbaru: "new_password",
      confirmpw: "new_password",
    };
    req.user = { id: "1" };
    const mockUser = {
      password: await bcrypt.hash("old_password", 10),
      save: jest.fn().mockResolvedValue({}),
    };
    sinon.stub(User, "findById").resolves(mockUser);
    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(bcrypt, "hash").resolves("hashed_new_password");

    await updatePassword(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil Update Password")
    );
  });
});
