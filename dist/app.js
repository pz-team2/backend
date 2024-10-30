"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const categories_1 = __importDefault(require("./routes/categories"));
const events_1 = __importDefault(require("./routes/events"));
const organizers_1 = __importDefault(require("./routes/organizers"));
const payments_1 = __importDefault(require("./routes/payments"));
const tickets_1 = __importDefault(require("./routes/tickets"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Database connection
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        yield mongoose_1.default.connect(mongoURI);
        console.log("MongoDB Connected...");
    }
    catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
});
connectDB();
// Middleware setup
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use((0, cors_1.default)());
// Routes
app.use("/", index_1.default);
app.use("/api/users", users_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/events", events_1.default);
app.use("/api/organizers", organizers_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/tickets", tickets_1.default);
// Error handling
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: Object.assign({ message: err.message }, (process.env.NODE_ENV === "development" ? { stack: err.stack } : {})),
    });
});
exports.default = app;
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map