import { ipcMain } from 'electron'
import ReportRepository from '../repository/reportRepository.js'

export default function registerReportIpc(db) {
  const repo = new ReportRepository(db)

  ipcMain.handle('report:getOverview', async () => repo.getOverview())
}
