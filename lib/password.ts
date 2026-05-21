import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * 把用户输入的明文密码转换成不可直接还原的哈希字符串。
 *
 * 数据库存储格式：
 * salt:hash
 *
 * salt 的作用：
 * 即使两个用户密码一样，最终保存到数据库里的结果也不一样。
 */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

/**
 * 验证用户登录时输入的密码是否正确。
 *
 * 下一步做登录接口时会用到。
 */
export function verifyPassword(
  password: string,
  storedPasswordHash: string
) {
  const [salt, storedHash] = storedPasswordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const hashBuffer = Buffer.from(
    scryptSync(password, salt, 64).toString("hex"),
    "hex"
  );

  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (hashBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, storedHashBuffer);
}