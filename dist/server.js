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
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
let sqId;
const serialNumber = mongoose_1.default.model("serialNumber", new mongoose_1.default.Schema({
    seq_number: { type: Number },
}));
function getInitilize() {
    return __awaiter(this, void 0, void 0, function* () {
        if (sqId === undefined) {
            const seqN = yield serialNumber.find();
            if (seqN.length === 0) {
                const s = yield new serialNumber({
                    seq_number: 1,
                });
                const ss = yield s.save();
                sqId = ss.id;
            }
            else {
                sqId = seqN[0].id;
            }
        }
    });
}
const burger = mongoose_1.default.model("burger", new mongoose_1.default.Schema({
    customerNumber: { type: String, require: true },
    orderName: { type: String, require: true },
}));
app.use(express_1.default.static(node_path_1.default.resolve(__dirname, "../web/dist/")));
app.post("/add-order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new burger({
            customerNumber: req.body.customerNumber,
            orderName: req.body.orderName,
        }).save();
    }
    catch (error) {
        return res.status(500).send(error);
    }
    res.status(200).json("done");
}));
app.get("/seq", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!sqId) {
        yield getInitilize();
    }
    let v = yield serialNumber.findByIdAndUpdate({ _id: sqId }, {
        $inc: { seq_number: 1 },
    });
    const id = `BURG-00${v === null || v === void 0 ? void 0 : v.seq_number}`;
    res.json({ id: id });
}));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendFile(node_path_1.default.resolve(__dirname, "../web/dist/index.html"));
}));
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log("connected to mongo database"))
    .catch((e) => console.log(e));
app.listen(PORT, () => {
    console.log(`server is running on PORT:${PORT}`);
});
