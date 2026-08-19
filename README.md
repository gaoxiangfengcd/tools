# Toolly / QuickTools 部署说明

项目地址：

```bash
https://github.com/gaoxiangfengcd/tools.git
```

线上域名：

```bash
https://tools.jiandengcun.com
```

## 本地开发

进入项目：

```bash
cd /Users/gaoxiangfeng/Desktop/我的软件/toolbox-hub
```

安装依赖：

```bash
npm install
```

启动本地预览：

```bash
npm run dev
```

构建正式版本：

```bash
npm run build
```

构建后会生成：

```bash
dist/
dist/sitemap.xml
dist/robots.txt
```

## 环境变量

本地需要有 `.env` 文件：

```bash
VITE_GA_MEASUREMENT_ID=G-QZ78SR2SLB
VITE_SITE_URL=https://tools.jiandengcun.com
```

注意：`.env` 不提交到 GitHub。换电脑时复制 `.env.example`：

```bash
cp .env.example .env
```

然后把 Google Analytics ID 改成真实 ID。

## 提交到 GitHub

本地改完代码后：

```bash
cd /Users/gaoxiangfeng/Desktop/我的软件/toolbox-hub
git status
git add .
git commit -m "Update site"
git push
```

## 服务器首次部署

登录 DigitalOcean 服务器：

```bash
ssh root@你的服务器IP
```

安装基础环境：

```bash
sudo apt update
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

拉取项目：

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/gaoxiangfengcd/tools.git tools
cd /var/www/tools
```

创建 `.env`：

```bash
cp .env.example .env
nano .env
```

`.env` 内容：

```bash
VITE_GA_MEASUREMENT_ID=G-QZ78SR2SLB
VITE_SITE_URL=https://tools.jiandengcun.com
```

安装并构建：

```bash
npm install
npm run build
```

## Nginx 配置

新建配置：

```bash
sudo nano /etc/nginx/sites-available/tools
```

写入：

```nginx
server {
    listen 80;
    server_name tools.jiandengcun.com;

    root /var/www/tools/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /sitemap.xml {
        try_files $uri =404;
    }

    location = /robots.txt {
        try_files $uri =404;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/tools /etc/nginx/sites-enabled/tools
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS 证书

安装 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

申请 SSL：

```bash
sudo certbot --nginx -d tools.jiandengcun.com
```

检查自动续期：

```bash
sudo certbot renew --dry-run
```

## 服务器后续更新

以后每次本地推送 GitHub 后，在服务器执行：

```bash
ssh root@你的服务器IP
cd /var/www/tools
git pull
npm install
npm run build
sudo systemctl reload nginx
```

检查是否成功：

```bash
curl -I https://tools.jiandengcun.com
curl -I https://tools.jiandengcun.com/sitemap.xml
```

## Google Search Console

站点地图地址：

```bash
https://tools.jiandengcun.com/sitemap.xml
```

如果新增了页面，部署后重新打开 Search Console，进入：

```text
站点地图
```

确认 sitemap 状态是“成功”。

## Google AdSense 准备

申请广告前确认这些页面可以访问：

```bash
https://tools.jiandengcun.com/about
https://tools.jiandengcun.com/contact
https://tools.jiandengcun.com/privacy-policy
https://tools.jiandengcun.com/terms
```

联系邮箱：

```bash
gaoxiangfengcd@gmail.com
```

## 常见问题

如果 `npm install` 报 `ENOTEMPTY` 或依赖异常：

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

如果打开工具详情页 404，检查 Nginx 是否包含：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

如果 sitemap 提交失败，先在浏览器打开：

```bash
https://tools.jiandengcun.com/sitemap.xml
```

能看到 XML 内容后，再提交到 Search Console。
