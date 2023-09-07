import mysqlPromise from "mysql2/promise"
import config from "../config/config";

export const Poll = mysqlPromise.createPool({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE
})
