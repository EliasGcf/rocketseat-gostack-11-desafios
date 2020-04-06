const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function middlewareCheckRepoExists(req, res, next) {
  const { id } = req.params;

  const repoExists = repositories.find(repo => repo.id === id);

  if (!repoExists) {
    return res.status(400).json({ error: 'Repository not found' });
  }

  req.repo = repoExists;

  return next();
}

app.get("/repositories", (req, res) => {
  return res.json(repositories);
});

app.post("/repositories", (req, res) => {
  const { title, url, techs } = req.body;

  const repoExists = repositories.find(repo => repo.url === url);

  if (repoExists) {
    return res.json(repoExists);
  }

  const newRepo = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(newRepo);

  return res.json(newRepo);
});

app.put("/repositories/:id", middlewareCheckRepoExists, (req, res) => {
  const { repo } = req;
  const { title, url, techs } = req.body;

  repo.title = title;
  repo.url = url;
  repo.techs = techs;

  return res.json(repo);
});

app.delete("/repositories/:id", middlewareCheckRepoExists, (req, res) => {
  const { id } = req.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  repositories.splice(repoIndex, 1);

  return res.status(204).json({});
});

app.post("/repositories/:id/like", middlewareCheckRepoExists, (req, res) => {
  const { repo } = req;

  repo.likes = repo.likes + 1;

  return res.json({
    likes: repo.likes,
  });
});

module.exports = app;
