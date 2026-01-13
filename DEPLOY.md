# GitHub Pages 部署說明

## 已設置自動部署

專案已配置 GitHub Actions 自動部署到 GitHub Pages。

## 重要：修改儲存庫名稱

在推送到 GitHub 之前，請根據你的實際儲存庫名稱修改 `vite.config.ts` 中的 `base` 路徑：

```typescript
base: process.env.NODE_ENV === 'production' ? '/你的儲存庫名稱/' : '/',
```

例如，如果你的儲存庫名稱是 `shooting-game`，則改為：
```typescript
base: process.env.NODE_ENV === 'production' ? '/shooting-game/' : '/',
```

## 部署步驟

1. **在 GitHub 建立儲存庫**
   - 記住你的儲存庫名稱

2. **修改 vite.config.ts**
   - 將 `base` 路徑中的 `/Phaser/` 改為你的實際儲存庫名稱

3. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit with GitHub Pages deployment"
   git branch -M main
   git remote add origin https://github.com/你的用戶名/你的儲存庫名稱.git
   git push -u origin main
   ```

4. **啟用 GitHub Pages**
   - 進入 GitHub 儲存庫的 Settings
   - 左側選單選擇 Pages
   - Source 選擇 "GitHub Actions"
   - 儲存

5. **等待部署完成**
   - 推送代碼後，GitHub Actions 會自動構建和部署
   - 可以在 Actions 標籤頁查看部署進度
   - 部署完成後，遊戲會在 `https://你的用戶名.github.io/你的儲存庫名稱/` 上線

## 注意事項

- 首次部署可能需要 5-10 分鐘
- 如果 base 路徑設置錯誤，頁面會無法正常載入資源
- 部署後如有問題，檢查瀏覽器控制台的錯誤訊息
