const { spinner } = require("@clack/prompts");

module.exports = async (tasks) => {
  for (const task of tasks) {
    if (task.enabled !== false) {
      let s = spinner();
      s.start(task.title);
      const result = await task.task(s);
      s.stop(result || task.title);
    }
  }
};
