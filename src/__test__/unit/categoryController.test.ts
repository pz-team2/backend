import { Request, Response } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/categoryController";
import Category from "../../models/Category";
import apiResponse from "../../utils/apiResource";
import sinon from "sinon";

describe("Category Controller", () => {
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

  test("should get all categories", async () => {
    const mockCategories = [
      { name: "Category 1", description: "Description 1" },
    ];
    sinon.stub(Category, "find").resolves(mockCategories);

    await getCategories(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil mendapatkan kategori", mockCategories)
    );
  });

  test("should get category by id", async () => {
    req.params = { id: "1" };
    const mockCategory = { name: "Category 1", description: "Description 1" };
    sinon.stub(Category, "findById").resolves(mockCategory);

    await getCategoryById(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil mendapatkan kategori", mockCategory)
    );
  });

  test("should create a new category", async () => {
    req.body = { name: "Category 1", description: "Description 1" };
    const mockCategory = {
      _id: "anyid",
      name: "Category 1",
      description: "Description 1",
    };
    sinon.stub(Category.prototype, "save").resolves(mockCategory);

    await createCategory(req as Request, res as Response);

    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        success: true,
        message: "Kategori berhasil ditambahkan",
        data: expect.objectContaining({
          name: "Category 1",
          description: "Description 1",
        }),
      })
    );
  });

  test("should update a category", async () => {
    req.params = { id: "1" };
    req.body = { name: "Category 1", description: "Description 1" };
    const mockCategory = { name: "Category 1", description: "Description 1" };
    sinon.stub(Category, "findByIdAndUpdate").resolves(mockCategory);

    await updateCategory(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Kategori berhasil diperbarui", mockCategory)
    );
  });

  test("should delete a category", async () => {
    req.params = { id: "1" };
    const mockCategory = { name: "Category 1", description: "Description 1" };
    sinon.stub(Category, "findByIdAndDelete").resolves(mockCategory);

    await deleteCategory(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Kategori berhasil dihapus")
    );
  });
});
