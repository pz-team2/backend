import { Request, Response } from "express";
import {
  tambahEvent,
  getEvent,
  getEventById,
  updateEvent,
  hapusEvent,
  getRecentEvents,
} from "../../controllers/eventController";
import Event from "../../models/Event";
import apiResponse from "../../utils/apiResource";
import sinon from "sinon";
import { Query } from "mongoose";

describe("Event Controller", () => {
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

  test("should add a new event", async () => {
    req.file = { path: "path/to/image.jpg" } as Express.Multer.File;
    req.body = {
      title: "Event 1",
      quota: 100,
      price: 50,
      startTime: "10:00",
      finishTime: "12:00",
      date: "2023-12-31",
      address: "123 Street",
      status: "active",
      description: "Description",
      organizer: "OrganizerId",
      category: "CategoryId",
    };
    const mockEvent = {
      _id: "anyid",
      ...req.body,
      picture: req.file.path,
    };
    sinon.stub(Event.prototype, "save").resolves(mockEvent);

    await tambahEvent(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        success: true,
        message: "Berhasil Menambahkan Data",
        data: expect.objectContaining({
          newEvent: expect.objectContaining({
            title: "Event 1",
            quota: 100,
            price: 50,
            startTime: "10:00",
            finishTime: "12:00",
            date: new Date("2023-12-31T00:00:00.000Z"),
            address: "123 Street",
            status: "active",
            description: "Description",
            picture: "path/to/image.jpg",
          }),
        }),
      })
    );
  });

  test("should get all events", async () => {
    const mockEvents = [{ title: "Event 1", address: "123 Street" }];
    sinon.stub(Event, "find").resolves(mockEvents);

    await getEvent(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Event berhasil diambil", mockEvents)
    );
  });

  test("should get event by id", async () => {
    req.params = { id: "1" };
    const mockEvent = { title: "Event 1", address: "123 Street" };
    sinon.stub(Event, "findById").resolves(mockEvent);

    await getEventById(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Event berhasil diakses", mockEvent)
    );
  });

  test("should update an event", async () => {
    req.params = { id: "1" };
    req.body = { title: "Event 1 Updated", address: "123 Street Updated" };
    const mockEvent = {
      title: "Event 1",
      address: "123 Street",
      save: jest.fn().mockResolvedValue({}),
    };
    sinon.stub(Event, "findById").resolves(mockEvent);

    await updateEvent(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Event berhasil diperbarui", mockEvent)
    );
  });

  test("should delete an event", async () => {
    req.params = { id: "1" };
    const mockEvent = { title: "Event 1", address: "123 Street" };
    sinon.stub(Event, "findByIdAndDelete").resolves(mockEvent);

    await hapusEvent(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Event berhasil dihapus", mockEvent)
    );
  });

  test("should get recent events with pagination", async () => {
    req.query = { limit: "10", page: "1" };
    const mockEvents = [{ title: "Event 1", address: "123 Street" }];
    const mockQuery = {
      sort: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().returnsThis(),
      populate: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(mockEvents),
    };

    sinon
      .stub(Event, "find")
      .returns(mockQuery as unknown as Query<any[], any>);
    sinon.stub(Event, "countDocuments").resolves(1);

    await getRecentEvents(req as Request, res as Response);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      apiResponse(true, "Berhasil mendapatkan event terbaru", {
        data: mockEvents,
        pagination: {
          total: 1,
          page: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    );
  });
});
