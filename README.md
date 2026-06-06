# 漫游日记 MVP

一个零依赖的城市一日游 Web MVP，验证以下核心体验：

- Highlight：精选历史地点与故事详情
- Timeline：当天路线、时间、步行距离和完成状态
- Map：地点、路线、当前位置与 Timeline 双向联动
- Location trigger：通过“模拟到达”演示接近地点后的触发流程
- Progress：到达后自动更新进度并推荐下一站

## 运行

直接在浏览器打开 `index.html`，或在当前目录启动任意静态文件服务器：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## MVP 边界

当前地图是无 API key 的交互式示意地图，地点数据保存在 `app.js`。生产版本可以将其替换为 MapLibre/Mapbox，并把地点、路线和用户行程迁移到后端 API。

下一阶段建议：

1. 接入 MapLibre 与真实 GeoJSON 路线。
2. 增加 GPS、Geofencing 和后台位置权限。
3. 使用 PostgreSQL + PostGIS 存储地点和距离查询。
4. 增加内容管理后台和多语言语音讲解。
5. 将 Web MVP 封装为 React Native 或 Expo 移动应用。
