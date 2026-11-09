// The small part of GitHub's API the admin area uses.

const API = "https://api.github.com";
const BRANCHES = new Set(["main", "practice"]);

export class GitHubProblem extends Error {
  constructor(status, where) {
    super(`GitHub ${status} at ${where}`);
    this.status = status;
    this.where = where;
  }
}

// The branch comes only from the server's own settings, never from the browser.
export function publishBranch(env) {
  return BRANCHES.has(env.PUBLISH_BRANCH) ? env.PUBLISH_BRANCH : null;
}

export function gitHub(env) {
  const repo = `${API}/repos/${env.GITHUB_REPO}`;
  const headers = {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "user-agent": "cork-music-station-admin",
    "x-github-api-version": "2022-11-28",
  };

  async function call(method, path, body, where) {
    const response = await fetch(`${repo}${path}`, {
      method,
      headers: body ? { ...headers, "content-type": "application/json" } : headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new GitHubProblem(response.status, where);
    return response;
  }
  const json = async (...args) => (await call(...args)).json();

  return {
    head: async (branch) => (await json("GET", `/git/ref/heads/${branch}`, null, "ref")).object.sha,
    treeOf: async (commit) => (await json("GET", `/git/commits/${commit}`, null, "commit")).tree.sha,
    // Every file's path and blob ID. Stops if GitHub cuts the list short, because a partial list could mislead.
    files: async (tree) => {
      const result = await json("GET", `/git/trees/${tree}?recursive=1`, null, "tree");
      if (result.truncated) throw new GitHubProblem(413, "tree");
      return new Map(result.tree.filter((e) => e.type === "blob").map((e) => [e.path, e.sha]));
    },
    readFile: async (path, ref) => {
      const response = await fetch(`${repo}/contents/${path}?ref=${ref}`, { headers: { ...headers, accept: "application/vnd.github.raw+json" } });
      if (response.status === 404) return null;
      if (!response.ok) throw new GitHubProblem(response.status, "read");
      return response.text();
    },
    createTree: async (base, entries) => (await json("POST", "/git/trees", { base_tree: base, tree: entries }, "createTree")).sha,
    createCommit: async (message, tree, parent) => (await json("POST", "/git/commits", {
      message,
      tree,
      parents: [parent],
      author: { name: "Cork Music Station Admin", email: "admin@users.noreply.github.com" },
    }, "createCommit")).sha,
    // Never forced. If someone else got in first, GitHub answers 422 and the whole change is rebuilt on top of theirs.
    moveBranch: async (branch, commit) => call("PATCH", `/git/refs/heads/${branch}`, { sha: commit, force: false }, "moveBranch"),
  };
}
