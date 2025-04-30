/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

/**
 * Custom error for failed individual find operations (i.e., by primary key).
 */
export class NotFoundError extends Error {
  /**
   * Constructor for NotFoundError
   *
   * @param message Error message (description for user of the logic producing the error)
   */
  public constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
  }
}
