import Database from 'better-sqlite3'

export default function createDatabase() {
  const db = new Database('./database.db', {
    //chỉ đọc dữ liệu, không thể CRUD nếu true
    readonly: false,
    // thời gian chờ nếu db bị khóa
    timeout: 5000,
    //nếu true thì file db không tồn tại thì sẽ báo lỗi
    fileMustExist: false,
    //hiển thị log khi thực hiện query
    verbose: console.log
  })

  return db
}
