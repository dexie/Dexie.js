import { DXCAlert } from "../types/DXCAlert";

/** Resolve a message template with parameters.
 * 
 * Example:
 *  resolveText({
 *    message: "Hello {name}!",
 *    messageCode: "HELLO",
 *    messageParams: {name: "David"}
 *  }) => "Hello David!"
 *  
 * @param message Template message with {vars} in it.
 * @param messageCode Unique code for the message. Can be used for translation.
 * @param messageParams Parameters to be used in the message.
 * @returns A final message where parameters have been replaced with values.
 */
export function resolveText({message, messageCode, messageParams}: DXCAlert) {
  return message.replace(/\{\w+\}/ig, n => messageParams[n.substring(1, n.length-1)]);
}
