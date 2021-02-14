declare abstract class MultiStats {
  toString(options?: {
    /** Makes the build much quieter */
    chunks: boolean;
    /** Shows colors in the console */
    colors: boolean;
  }): string;
}
