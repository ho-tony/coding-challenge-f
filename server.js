const fastify = require("fastify")({
  logger: {
    level: "info",
    target: "pino-pretty",
    options: {
      levelFirst: true,
      translateTime: true,
      colorize: true,
    },
  },
});

db = require("./db");

let id = 0;
fastify.get("/", async (request, reply) => {
  return { message: "Hi fetch" };
});

/*
add route accepts a transaction that contains player, points to be added, and timestamp in json
*/

async function spend(request, reply) {
  let { points } = request.body;
  if (points < 0) {
    points *= -1;
  }
  let balance_map = {};

  const query = db.transaction(() => {
    const selectStmt = db.prepare(
      `SELECT * FROM transactions ORDER BY timestamp ASC`
    );
    const transactions = selectStmt.all();
    for (let action of transactions) {
      let deductedPts = 0;
      if (points == 0) {
        break;
      }
      deductedPts = Math.min(action.points, points);
      points -= deductedPts;
      const updateActionQuery = db.prepare(
        `UPDATE transactions SET points = ? WHERE id = ?`
      );
      updateActionQuery.run(action.points - deductedPts, action.id);
      if (action.payer in balance_map) {
        balance_map[action.payer] -= deductedPts;
      } else {
        balance_map[action.payer] = -deductedPts;
      }
    }

    if (points > 0) {
      reply
        .status(400)
        .type("text/plain")
        .send("User doesn't have enough points");
    }

    const jsonRes = Object.keys(balance_map).map((person) => ({
      payer: person,
      points: balance_map[person],
    }));

    return jsonRes;
  });

  const deductions = query();
  return reply.status(200).send(deductions);
}

fastify.post("/add", async (request, reply) => {
  const { payer, points, timestamp } = request.body;
  if (points < 0) {
    return spend(request, reply);
  }
  const insertStmt = db.prepare(`
        INSERT INTO transactions (id, payer, points, timestamp)
        VALUES (?, ?, ?, ?)
      `);

  insertStmt.run(id, payer, points, timestamp);
  id++;
  return reply.status(200).send();
});

// maybe use post request for more security?
fastify.get("/balance", async (request, reply) => {
  const select = db.prepare(`SELECT payer, points FROM transactions`);
  const transactions = select.all();
  let balance_map = {};
  for (let action of transactions) {
    const { payer, points } = action;
    if (balance_map[payer]) {
      balance_map[payer] += points;
    } else {
      balance_map[payer] = points;
    }
  }
  const jsonRes = Object.keys(balance_map).map((person) => ({
    payer: person,
    points: balance_map[person],
  }));

  return reply.status(200).send(jsonRes);
});

fastify.post("/spend", async (request, reply) => {
  return spend(request, reply);
});

// Start the server
const start = async () => {
  try {
    const PORT = 8000;
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    fastify.log.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
