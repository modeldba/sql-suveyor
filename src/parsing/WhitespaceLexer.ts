import { TokenSource, Token, CharStream, TokenFactory, CommonToken } from "antlr4ts";

/**
 * A very simple lexer for splitting a string into tokens based on 
 * whitespace. Handles SQL quote characters (i.e. '). Also splits ; as a separate token
 * 
 * THIS SHOULD NOT BE USED FOR MOST ANTLR4 TASKS.
 * 
 * It is designed to be used to find the correct token index at
 * any string location, regardless of the validity of the string.
 * See SQLSurveyer.getTokenIndexAt for usage.
 */
export class WhitespaceLexer implements TokenSource {

  value: string;
  currentIndex: number;
  insideQuote: boolean;

  constructor(value: string) {
    this.value = value;
    this.currentIndex = 0;
    this.insideQuote = false;
  }

  nextToken(): Token {
    let start = null;
    let stop = null;
    const notWhitespaceRegex = /[^\s]/;
    while (this.currentIndex < this.value.length) {
      const currentChar = this.value[this.currentIndex];
      if (currentChar === "'" && this.value[this.currentIndex - 1] !== '\\') {
        this.insideQuote = !this.insideQuote;
      }
      if ((notWhitespaceRegex.test(currentChar) && currentChar !== ';') || this.insideQuote) {
        if (start === null) {
          start = this.currentIndex;
        }
        if (this.currentIndex === this.value.length - 1) {
          stop = this.currentIndex;
        }
      } else if (start !== null) {
        stop = this.currentIndex - 1;
        if (currentChar === ';') {
          // The next block will iterate past the current ';'
          // Need to back up so that on the next call to nextToken, the ';' will be identified again
          this.currentIndex--;
        }
      }
      if (start !== null && stop !== null) {
        this.currentIndex++;
        return new CommonToken(Token.DEFAULT_CHANNEL, this.value.substring(start, stop + 1), {}, null, start, stop);
      }
      if (currentChar === ';' && !this.insideQuote) {
        this.currentIndex++;
        return new CommonToken(Token.DEFAULT_CHANNEL, ';', {}, null, this.currentIndex - 1, this.currentIndex - 1);
      }
      this.currentIndex++;
    }
    return new CommonToken(Token.EOF);
  }

  line: number;
  charPositionInLine: number;
  inputStream: CharStream;
  sourceName: string;
  tokenFactory: TokenFactory;
  
}