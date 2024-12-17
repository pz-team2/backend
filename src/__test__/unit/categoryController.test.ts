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
      json: jest.fn(),
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

    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil mendapatkan kategori", mockCategories, 200)
    );
  });

  test("should handle error on getCategories", async () => {
    sinon.stub(Category, "find").rejects(new Error("DB Error"));

    await getCategories(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(false, "Gagal mendapatkan kategori", expect.any(Error), 500)
    );
  });

  test("should get category by id", async () => {
    req.params = { id: "1" };
    const mockCategory = { name: "Category 1", description: "Description 1" };
    sinon.stub(Category, "findById").resolves(mockCategory);

    await getCategoryById(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil mendapatkan kategori", mockCategory, 200)
    );
  });

  test("should return 404 if category not found", async () => {
    req.params = { id: "1" };
    sinon.stub(Category, "findById").resolves(null);

    await getCategoryById(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(false, "Kategori tidak ditemukan", null, 404)
    );
  });

  // test("should create a new category", async () => {
  //   req.body = { name: "Category 1", description: "Description 1" };

  //   const mockCategory = {
  //     _id: "6761996f1bc8426b575e11a9", // Dummy ID
  //     name: "Category 1",
  //     description: "Description 1",
  //   };

  //   const saveStub = sinon
  //     .stub(Category.prototype, "save")
  //     .resolves(mockCategory);

  //   await createCategory(req as Request, res as Response);

  //   expect(saveStub.calledOnce).toBeTruthy(); // Pastikan save dipanggil
  //   expect(res.status).toBeCalledWith(201);
  //   expect(res.json).toBeCalledWith(
  //     expect.objectContaining({
  //       success: true,
  //       message: "Kategori berhasil ditambahkan",
  //       data: expect.objectContaining({
  //         _id: expect.any(String),
  //         name: "Category 1",
  //         description: "Description 1",
  //       }),
  //       code: 201,
  //     })
  //   );
  // });

  test("should handle error on createCategory", async () => {
    req.body = { name: "Category 1", description: "Description 1" };
    sinon.stub(Category.prototype, "save").rejects(new Error("DB Error"));

    await createCategory(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(false, "Gagal menambahkan kategori", expect.any(Error), 500)
    );
  });

  test("should update a category", async () => {
    req.params = { id: "1" };
    req.body = { name: "Category 1", description: "Updated Description" };
    const mockCategory = {
      name: "Category 1",
      description: "Updated Description",
    };
    sinon.stub(Category, "findByIdAndUpdate").resolves(mockCategory);

    await updateCategory(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(true, "Kategori berhasil diperbarui", mockCategory, 200)
    );
  });

  test("should return 404 if category not found for update", async () => {
    req.params = { id: "1" };
    req.body = { name: "Category 1" };
    sinon.stub(Category, "findByIdAndUpdate").resolves(null);

    await updateCategory(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(false, "Kategori tidak ditemukan", null, 404)
    );
  });

  test("should delete a category", async () => {
    req.params = { id: "1" };
    const mockCategory = { name: "Category 1", description: "Description 1" };
    sinon.stub(Category, "findByIdAndDelete").resolves(mockCategory);

    await deleteCategory(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(true, "Kategori berhasil dihapus", null, 200)
    );
  });

  test("should return 404 if category not found for delete", async () => {
    req.params = { id: "1" };
    sinon.stub(Category, "findByIdAndDelete").resolves(null);

    await deleteCategory(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(false, "Kategori tidak ditemukan", null, 404)
    );
  });

  test("should handle error on deleteCategory", async () => {
    req.params = { id: "1" };
    sinon.stub(Category, "findByIdAndDelete").rejects(new Error("DB Error"));

    await deleteCategory(req as Request, res as Response);

    expect(res.json).toBeCalledWith(
      apiResponse(false, "Gagal menghapus kategori", expect.any(Error), 500)
    );
  });
});
