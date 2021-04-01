import * as core from "@actions/core";
import * as github from "@actions/github";

interface Label {
  color: string;
  default: boolean;
  description: string;
  name: string;
  node_id: string;
  url: string;
}

async function run(): Promise<void> {
  try {
    const allowedLabels: string[] = core
      .getInput("allowed", { required: true })
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x !== "");

    core.info(`allowed labels: ${allowedLabels}`);

    const pr = github.context.payload.pull_request;
    if (!pr) {
      core.info("not a pull request");
      return;
    }

    const prLabels: Label[] | undefined = pr?.labels;
    const labels = prLabels?.map((l) => l.name);

    core.info(`pull request labels: ${labels}`);

    if (!labels?.length) {
      core.setFailed("pull request has no labels");
      return;
    }

    const matched: string[] = [];
    const notMatched: string[] = [];
    for (const l of labels) {
      if (allowedLabels.find((al) => al.toLowerCase() === l.toLowerCase())) {
        matched.push(l);
      } else {
        notMatched.push(l);
      }
    }

    core.info(`matched ${matched.length === 0 ? "none" : matched}`);
    core.info(`not matched ${notMatched.length === 0 ? "none" : notMatched}`);

    if (matched.length !== 1) {
      core.setFailed(
        `expecting only one matched label, but found ${matched.length === 0 ? "none" : matched}`,
      );
    } else {
      core.info(`found exactly one allowed label ${matched[0]}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
