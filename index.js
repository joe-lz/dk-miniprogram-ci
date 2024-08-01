const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const ci = require("miniprogram-ci");
const dayjs = require("dayjs");

async function run() {
  try {
    const projectPath = core.getInput("project-path", { required: true });
    const privatekey = core.getInput("private-key", { required: true });

    // 构建完整的 project.config.json 路径
    const projectConfigPath = path.join(projectPath, "project.config.json");
    console.log("projectConfigPath", projectConfigPath);
    // 读取和解析 project.config.json 文件
    const projectConfig = JSON.parse(
      fs.readFileSync(projectConfigPath, "utf8")
    );

    // 从 project.config.json 获取需要的配置，这里拿到 appid
    const appid = projectConfig.appid;

    // 版本信息
    const version = core.getInput("version") || "1.0.0";
    // 本次提交的描述
    const description =
      core.getInput("desc") || `更新于${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;

    // 创建 Project 实例
    const project = new ci.Project({
      appid,
      type: "miniProgram",
      projectPath,
      privateKey: privatekey,
      ignores: ["node_modules/**/*"],
    });

    // 其他配置
    const context = {
      compileOptions: {
        "urlCheck": true,
        "es6": true,
        "enhance": false,
        "compileHotReLoad": true,
        "postcss": false,
        "minified": true,
        "condition": false,
        "skylineRenderEnable": true,
        "compileWorklet": true,
      }, // 编译配置
      robot: core.getInput("robot") || 1, // 机器人编号
      threads: 1, // 线程数
      allowIgnoreUnusedFiles: false, // 允许忽略未使用的文件
    };

    // 上传进度的回调函数
    const onProgressUpdate = (info) => {
      console.log("上传进度：", info);
    };

    // 执行上传
    await ci.upload({
      project,
      version,
      desc: description,
      setting: context.compileOptions,
      robot: context.robot,
      threads: context.threads,
      allowIgnoreUnusedFiles: context.allowIgnoreUnusedFiles,
      onProgressUpdate,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
