import { useReducer, useEffect, useState, FormEvent, Key } from "react";

type initial = {
    amount: number;
    aloo: number;
    paneer: number;
    cheese: number;
    quantity: number;
};

type actionType = {
    type: string;
    payload?: number;
};

type toppingType = {
    name: string;
    cost: number;
};

function calculateAmount(s: initial, time: number): number {
    let amount = s.aloo * 15 + s.cheese * 20 + s.paneer * 25;
    return amount * time;
}

function reducer(state: initial, action: actionType) {
    switch (action.type) {
        case "add-aloo": {
            return {
                ...state,
                aloo: state.aloo + 1,
                amount: state.amount + 15 * state.quantity,
            };
        }
        case "minus-aloo": {
            return {
                ...state,
                aloo: state.aloo === 0 ? 0 : state.aloo - 1,
                amount:
                    state.aloo === 0
                        ? state.amount
                        : state.amount - 15 * state.quantity,
            };
        }
        case "add-paneer": {
            return {
                ...state,
                paneer: state.paneer + 1,
                amount: state.amount + 25 * state.quantity,
            };
        }
        case "minus-paneer": {
            return {
                ...state,
                paneer: state.paneer === 0 ? 0 : state.paneer - 1,
                amount:
                    state.paneer === 0
                        ? state.amount
                        : state.amount - 25 * state.quantity,
            };
        }
        case "add-cheese": {
            return {
                ...state,
                cheese: state.cheese + 1,
                amount: state.amount + 20 * state.quantity,
            };
        }
        case "minus-cheese": {
            return {
                ...state,
                cheese: state.cheese === 0 ? 0 : state.cheese - 1,
                amount:
                    state.cheese === 0
                        ? state.amount
                        : state.amount - 20 * state.quantity,
            };
        }
        case "add-burger": {
            return {
                ...state,
                quantity: state.quantity + 1,
                amount: calculateAmount(state, state.quantity + 1),
            };
        }
        case "minus-burger": {
            return {
                ...state,
                quantity: state.quantity === 1 ? 1 : state.quantity - 1,
                amount: calculateAmount(
                    state,
                    state.quantity === 1 ? 1 : state.quantity - 1
                ),
            };
        }
        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}

const topping: toppingType[] = [
    { name: "aloo", cost: 15 },
    { name: "paneer", cost: 25 },
    { name: "cheese", cost: 20 },
];

const intialState: initial = {
    amount: 0,
    aloo: 0,
    paneer: 0,
    cheese: 0,
    quantity: 1,
};

function App() {
    const [state, dispatch] = useReducer(reducer, intialState);
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [stack, setStack] = useState<number[]>([]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        fetch("/add-order", {
            method: "POST",
            body: JSON.stringify({
                customerNumber: phone,
                orderName: orderId,
            }),
            headers: { "Content-Type": "application/json" },
        })
            .then((r) => r.json())
            .then(() => {
                alert("done");
                window.location.reload();
            })
            .catch((e) => {
                alert("error");
                console.log(e);
            });
    };

    useEffect(() => {
        fetch("/seq")
            .then((r) => r.json())
            .then((d) => setOrderId(d.id))
            .catch((e) => console.log(e));
    }, []);

    function arrangeStack(s: number[], value: number): number[] {
        let newStack: number[] = [];
        let f = true;
        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === value && f) {
                f = false;
                continue;
            }
            newStack.push(s[i]);
        }
        return [...newStack.reverse()];
    }

    function changeStack(name: string, add: boolean) {
        if (add) {
            if (name === "aloo") setStack([...stack, 1]);
            if (name === "paneer") setStack([...stack, 2]);
            if (name === "cheese") setStack([...stack, 3]);
        } else {
            if (name === "aloo") setStack(arrangeStack(stack, 1));
            if (name === "paneer") setStack(arrangeStack(stack, 2));
            if (name === "cheese") setStack(arrangeStack(stack, 3));
        }
    }

    return (
        <main>
            <section>
                <h1 className="title">Burger</h1>
            </section>
            <section className="burger-section">
                <div>
                    <div className="dis">
                        <Bread />
                        {stack.map((n: number, i: Key | null | undefined) => (
                            <div key={i}>
                                {n === 1 && <Aloo />}
                                {n === 2 && <Paneer />}
                                {n === 3 && <Cheese />}
                            </div>
                        ))}
                        <Bread />
                    </div>
                </div>
                <div>
                    {topping.map(({ name, cost }, i) => {
                        let buttonState = true;
                        for (let [key, value] of Object.entries(state)) {
                            if (key === name && value !== 0)
                                buttonState = false;
                        }
                        return (
                            <div key={i} className={`manu ${name}`}>
                                <button
                                    className="add"
                                    onClick={() => {
                                        dispatch({ type: `add-${name}` });
                                        changeStack(name, true);
                                    }}
                                >
                                    +
                                </button>
                                <div>
                                    {name} {name != "cheese" && "Tikki"} ({cost}
                                    /-)
                                </div>
                                <button
                                    className="minus"
                                    onClick={() => {
                                        dispatch({ type: `minus-${name}` });
                                        changeStack(name, false);
                                    }}
                                    disabled={buttonState}
                                >
                                    -
                                </button>
                            </div>
                        );
                    })}

                    <div className="list">
                        <p>Aloo : x{state.aloo}</p>
                        <p>paneer : x{state.paneer}</p>
                        <p>chesse : x{state.cheese}</p>
                    </div>
                    <div className="quantity">
                        <button
                            onClick={() => dispatch({ type: "add-burger" })}
                        >
                            +
                        </button>
                        <div>{state.quantity}</div>
                        <button
                            onClick={() => dispatch({ type: "minus-burger" })}
                        >
                            -
                        </button>
                    </div>
                    <p className="amount">Total Amount : {state.amount}/-</p>

                    <div>
                        <div>Order Number : {orderId}</div>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div>
                                <label>Phone number :</label>
                                <input
                                    type="text"
                                    placeholder="phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <button className="order-now">Order Now</button>
                        </form>
                        <div></div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default App;

const Bread = () => {
    return <div className="bread-com com"></div>;
};

const Aloo = () => {
    return <div className="aloo-com com "></div>;
};

const Cheese = () => {
    return <div className="cheese-com com"></div>;
};

const Paneer = () => {
    return <div className="paneer-com com"></div>;
};
