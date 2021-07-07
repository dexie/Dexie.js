import { DXCAlert } from "../types/DXCAlert";

export function resolveText({message, messageCode, messageParams}: DXCAlert) {
  return message.replace(/\{\w+\}/ig, n => messageParams[n.substr(1, n.length-2)]);
}
