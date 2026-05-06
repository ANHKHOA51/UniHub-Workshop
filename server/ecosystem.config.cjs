module.exports = {
  apps: [
    {
      name: "email-worker",
      script: "./src/workers/email.worker.js"
    },
    {
      name: "ai-summary-worker",
      script: "./src/workers/ai_summary.worker.js"
    },
    {
      name: "sync-csv-worker",
      script: "./src/workers/sync_csv.worker.js"
    }
  ]
}
