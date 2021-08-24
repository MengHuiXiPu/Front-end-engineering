## husky

#### Install husky

```
npm install husky --save-dev
```

#### Enable Git hooks

```
npx husky install
```

如果想安装后自动启用`hooks`，可以执行：

```
npm set-script prepare "husky install"
```

这样就会在`package.json`里面添加一条脚本：

```
// package.json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

> ```
> prepare` 是 `NPM` 操作生命周期中的一环，在执行 `install` 的时候会按生命周期顺序执行相应钩子：NPM7：`preinstall -> install -> postinstall -> prepublish -> preprepare -> prepare -> postprepare
> ```

这样就会在代码根目录生成如下所示的结构：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

### 添加 hook

我们可以使用`husky add <file> [cmd]`指令来添加一条`hook`。

#### commit-msg

在项目中我们会使用`commit-msg`这个`git hook`来校验我们`commit`时添加的备注信息是否符合规范。在以前我们通常是这样配置的：

```
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS" // 校验commit时添加的备注信息是否符合我们要求的规范
    }
  }
}
```

在新版`husky`中`$HUSKY_GIT_PARAMS`这个变量不再使用了，取而代之的是`$1`。所以我们要做如下操作：

执行`npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'`会在`.husky`下生成一个`commit-msg`的`shell`文件：

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
echo "========= 执行commit-msg校验 ======="
npx --no-install commitlint --edit $1
```

此时如果执行`git commit`操作，会有如下报错：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)提示我们缺少`commitlint.config.js`文件，这里先安装依赖：

```
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

然后在根目录新建一个`commitlint.config.js`文件并加入如下内容：

```
module.exports = {
  extends: ["@commitlint/config-conventional"]
};
```

这时再执行`commit`就会发现已经生效了：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

#### pre-commit

在`commit`前，我们可以执行测试用例、eslint 校验等，只有这些通过了，才允许提交。这也就是在`pre-commit`这个钩子里需要做的事情。

执行`npx husky add .husky/pre-commit "npm run test:unit"`就会在`.husky`下生成一个`pre-commit`的 shell 文件：

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "========= 执行pre-commit操作（如执行测试用例、eslint校验等，可自行添加） ======="
npm run test:unit
```

让我们再做一次`commit`操作：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

至此，我们就基于新版`husky`，完成了项目中`commit-msg`、`pre-commit`两个钩子的添加。