const express = require("express");
const router = express.Router();
const controller = require("../controller/query.controller");

// USER
router.post("/query", controller.createQuery);
router.get("/user/:userId/queries", controller.getUserQueries);

// THREAD MESSAGES
router.post("/message", controller.sendMessage);
router.get("/messages/:queryId", controller.getMessages);

// ADMIN
router.get("/admin/queries", controller.getAllQueries);
router.post("/admin/reply", controller.replyQuery);
router.delete("/admin/query/:queryId", controller.deleteQuery);

// USER DELETE
router.delete("/query/:queryId", controller.deleteQuery);

module.exports = router;
