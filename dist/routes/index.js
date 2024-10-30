"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categories_1 = __importDefault(require("./categories"));
const events_1 = __importDefault(require("./events"));
const organizers_1 = __importDefault(require("./organizers"));
const payments_1 = __importDefault(require("./payments"));
const tickets_1 = __importDefault(require("./tickets"));
const users_1 = __importDefault(require("./users"));
const router = express_1.default.Router();
router.use('/categories', categories_1.default);
router.use('/events', events_1.default);
router.use('/organizers', organizers_1.default);
router.use('/payments', payments_1.default);
router.use('/tickets', tickets_1.default);
router.use('/users', users_1.default);
router.get('/', (req, res) => {
    res.send('API Root');
});
exports.default = router;
//# sourceMappingURL=index.js.map