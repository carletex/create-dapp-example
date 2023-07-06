import { execa, ExecaError } from "execa";

export async function initGitRepository(targetDir: string) {
  try {
    await execa("git", ["init"], { cwd: targetDir });
    await execa("git", ["checkout", "-b", "main"], { cwd: targetDir });
    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa(
      "git",
      ["commit", "-m", "Initial commit with 🏗️ Scaffold-ETH 2"],
      { cwd: targetDir }
    );
  } catch (e: any) {
    // cast error as ExecaError to get stderr

    throw new Error("Failed to initialize git repository", {
      cause: e?.stderr ?? e,
    });
  }
}
