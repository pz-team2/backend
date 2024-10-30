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
// src/routes/organizers.ts
const express_1 = __importDefault(require("express"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const router = express_1.default.Router();
// Get all organizers
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizers = yield Organizer_1.default.find();
        res.json(organizers);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'An error occurred'
        });
    }
}));
// Create organizer
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }
        const organizer = new Organizer_1.default({ name });
        const newOrganizer = yield organizer.save();
        res.status(201).json(newOrganizer);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : 'An error occurred'
        });
    }
}));
// Get organizer by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizer = yield Organizer_1.default.findById(req.params.id);
        if (!organizer) {
            res.status(404).json({ message: 'Organizer not found' });
            return;
        }
        res.json(organizer);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'An error occurred'
        });
    }
}));
// Update organizer
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }
        const organizer = yield Organizer_1.default.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true });
        if (!organizer) {
            res.status(404).json({ message: 'Organizer not found' });
            return;
        }
        res.json(organizer);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'An error occurred'
        });
    }
}));
// Delete organizer
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizer = yield Organizer_1.default.findByIdAndDelete(req.params.id);
        if (!organizer) {
            res.status(404).json({ message: 'Organizer not found' });
            return;
        }
        res.json({ message: 'Organizer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'An error occurred'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=organizers.js.map