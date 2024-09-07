import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI!;
let sqId: mongoose.ObjectId;

const serialNumber = mongoose.model(
    "serialNumber",
    new mongoose.Schema({
        seq_number: { type: Number },
    })
);

async function getInitilize() {
    if (sqId === undefined) {
        const seqN = await serialNumber.find();
        if (seqN.length === 0) {
            const s = await new serialNumber({
                seq_number: 1,
            });
            const ss = await s.save();
            sqId = ss.id;
        } else {
            sqId = seqN[0].id;
        }
    }
}

const burger = mongoose.model(
    "burger",
    new mongoose.Schema({
        customerNumber: { type: String, require: true },
        orderName: { type: String, require: true },
    })
);

app.use(express.static(path.resolve(__dirname, "../web/dist/")));

app.post("/add-order", async (req, res) => {
    try {
        await new burger({
            customerNumber: req.body.customerNumber,
            orderName: req.body.orderName,
        }).save();
    } catch (error) {
        return res.status(500).send(error);
    }
    res.status(200).json("done");
});

app.get("/seq", async (req, res) => {
    if (!sqId) {
        await getInitilize();
    }

    let v = await serialNumber.findByIdAndUpdate(
        { _id: sqId },
        {
            $inc: { seq_number: 1 },
        }
    );
    const id = `BURG-00${v?.seq_number}`;
    res.json({ id: id });
});

app.get("/", async (req, res) => {
    res.sendFile(path.resolve(__dirname, "../web/dist/index.html"));
});

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("connected to mongo database"))
    .catch((e) => console.log(e));

app.listen(PORT, () => {
    console.log(`server is running on PORT:${PORT}`);
});
