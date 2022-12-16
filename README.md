# Segon-Painter

## Usage

在 Segon「冬日绘版」中自动 Painting！

## Configuration

1. `npm install`。
2. 使用 `scripts/loadPic.py` 生成图片的 `json` 格式，将其放到项目 `pictures` 目录下。
    - 需要安装 PIL 库：`pip install pillow`。
3. 复制 `config-example.json` 为 `config.json`，并配置以下内容：
    1. `picFile`：生成好的图片，支持多张图同时绘制：
        - `name`：`json` 文件名。
        - `x`,`y`：绘制时的坐标偏移量。
    2. `fetchTime`：更新地图的时间间隔，建议不要太小。（单位为 ms）
    3. `paintTime`：每个用户每次 paint 的时间间隔，建议比洛谷限制稍大。（单位为 ms）
    4. `random`：如果为 `true`，则每次随机选择需要绘制的点进行绘制；否则按「图片编号为第一关键字、坐标顺序为第二关键字」排序然后绘制。
    5. `users`：绘制所用的用户 `token`，可添加多个。
5. `npm start`，开始你的创作！
6. 创作中 Delta=维护难度，Speed=速度，ETime=剩余完成时间。
7. Token 数少的建议逐行，多的建议随机撒点。
8. config.json 中 `startTimestamp` 为开始时间戳，`endTimestamp` 为结束时间戳，默认设置中时间为 2022/12/17 0:00 - 2022/12/19 0:00

## Thanks

- Segon-Painter 部分取自 [Early0v0/Luogu-Painter](https://github.com/Early0v0/Luogu-Painter)
