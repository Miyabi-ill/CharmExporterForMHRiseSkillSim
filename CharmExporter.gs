// copy from https://github.com/anonyco/FastestSmallestTextEncoderDecoder
if (typeof TextEncoder === "undefined") {
  TextEncoder = function TextEncoder() { };
  TextEncoder.prototype.encode = function encode(str) {
    "use strict";
    var Len = str.length, resPos = -1;
    // The Uint8Array's length must be at least 3x the length of the string because an invalid UTF-16
    //  takes up the equivelent space of 3 UTF-8 characters to encode it properly. However, Array's
    //  have an auto expanding length and 1.5x should be just the right balance for most uses.
    var resArr = typeof Uint8Array === "undefined" ? new Array(Len * 1.5) : new Uint8Array(Len * 3);
    for (var point = 0, nextcode = 0, i = 0; i !== Len;) {
      point = str.charCodeAt(i), i += 1;
      if (point >= 0xD800 && point <= 0xDBFF) {
        if (i === Len) {
          resArr[resPos += 1] = 0xef/*0b11101111*/; resArr[resPos += 1] = 0xbf/*0b10111111*/;
          resArr[resPos += 1] = 0xbd/*0b10111101*/; break;
        }
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        nextcode = str.charCodeAt(i);
        if (nextcode >= 0xDC00 && nextcode <= 0xDFFF) {
          point = (point - 0xD800) * 0x400 + nextcode - 0xDC00 + 0x10000;
          i += 1;
          if (point > 0xffff) {
            resArr[resPos += 1] = (0x1e/*0b11110*/ << 3) | (point >>> 18);
            resArr[resPos += 1] = (0x2/*0b10*/ << 6) | ((point >>> 12) & 0x3f/*0b00111111*/);
            resArr[resPos += 1] = (0x2/*0b10*/ << 6) | ((point >>> 6) & 0x3f/*0b00111111*/);
            resArr[resPos += 1] = (0x2/*0b10*/ << 6) | (point & 0x3f/*0b00111111*/);
            continue;
          }
        } else {
          resArr[resPos += 1] = 0xef/*0b11101111*/; resArr[resPos += 1] = 0xbf/*0b10111111*/;
          resArr[resPos += 1] = 0xbd/*0b10111101*/; continue;
        }
      }
      if (point <= 0x007f) {
        resArr[resPos += 1] = (0x0/*0b0*/ << 7) | point;
      } else if (point <= 0x07ff) {
        resArr[resPos += 1] = (0x6/*0b110*/ << 5) | (point >>> 6);
        resArr[resPos += 1] = (0x2/*0b10*/ << 6) | (point & 0x3f/*0b00111111*/);
      } else {
        resArr[resPos += 1] = (0xe/*0b1110*/ << 4) | (point >>> 12);
        resArr[resPos += 1] = (0x2/*0b10*/ << 6) | ((point >>> 6) & 0x3f/*0b00111111*/);
        resArr[resPos += 1] = (0x2/*0b10*/ << 6) | (point & 0x3f/*0b00111111*/);
      }
    }
    if (typeof Uint8Array !== "undefined") return resArr.subarray(0, resPos + 1);
    // else // IE 6-9
    resArr.length = resPos + 1; // trim off extra weight
    return resArr;
  };
  TextEncoder.prototype.toString = function () { return "[object TextEncoder]" };
  try { // Object.defineProperty only works on DOM prototypes in IE8
    Object.defineProperty(TextEncoder.prototype, "encoding", {
      get: function () {
        if (TextEncoder.prototype.isPrototypeOf(this)) return "utf-8";
        else throw TypeError("Illegal invocation");
      }
    });
  } catch (e) { /*IE6-8 fallback*/ TextEncoder.prototype.encoding = "utf-8"; }
  if (typeof Symbol !== "undefined") TextEncoder.prototype[Symbol.toStringTag] = "TextEncoder";
}

function concatTypedArrays(a, b) { // a, b TypedArray of same type
  var c = new (a.constructor)(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}

/**
 * Base64 encode MHRise charm
 * @param input - The array of input data.
 * @return Base64 encoded charm data
 * @customfunction
 */
function encodeCharm(input) {
  if (input.map && input.length > 0) {
    if (input[0].map) {
      var charms = input.map(encodeCharm);
      var outputBytes = new Uint8Array();
      var encoder = Utilities.base64Encode;

      for (var charm of charms) {
        outputBytes = concatTypedArrays(outputBytes, charm);
      }

      var text = encoder(outputBytes);

      return chunkSubstr(text, 50000);
    }
    else {
      var skill1Name = input[0];
      var skill1Level = parseInt(input[1]) || 0;
      var skill2Name = input[2];
      var skill2Level = parseInt(input[3]) || 0;
      var charmSlot1 = parseInt(input[4]) || 0;
      var charmSlot2 = parseInt(input[5]) || 0;
      var charmSlot3 = parseInt(input[6]) || 0;

      if (charmSlot3 > charmSlot2 || charmSlot2 > charmSlot1) {
        throw new Error("charmSlot values must be ordered.");
      }

      if (!skill1Name) {
        return new Uint8Array();
      }

      var textEncoder = new TextEncoder();
      var outputBytes = new Uint8Array();
      var encodedSkill1 = textEncoder.encode(skill1Name);
      outputBytes = concatTypedArrays(outputBytes, new Uint8Array(['\n'.charCodeAt(0), encodedSkill1.length + 4, '\n'.charCodeAt(0), encodedSkill1.length]));
      outputBytes = concatTypedArrays(outputBytes, encodedSkill1);
      outputBytes = concatTypedArrays(outputBytes, new Uint8Array([16, skill1Level]));
      if (skill2Name) {
        var encodedSkill2 = textEncoder.encode(skill2Name);
        outputBytes = concatTypedArrays(outputBytes, new Uint8Array(['\n'.charCodeAt(0), encodedSkill2.length + 4, '\n'.charCodeAt(0), encodedSkill2.length]));
        outputBytes = concatTypedArrays(outputBytes, encodedSkill2);
        outputBytes = concatTypedArrays(outputBytes, new Uint8Array([16, skill2Level]));
      }
      var length = 0;
      if (charmSlot3 > 0) {
        length = 6;
      }
      else if (charmSlot2 > 0) {
        length = 4;
      }
      else if (charmSlot1 > 0) {
        length = 2;
      }

      outputBytes = concatTypedArrays(outputBytes, new Uint8Array([26, length]));
      if (charmSlot1 > 0) {
        outputBytes = concatTypedArrays(outputBytes, new Uint8Array([8, charmSlot1]));
      }
      if (charmSlot2 > 0) {
        outputBytes = concatTypedArrays(outputBytes, new Uint8Array([16, charmSlot2]));
      }
      if (charmSlot3 > 0) {
        outputBytes = concatTypedArrays(outputBytes, new Uint8Array([24, charmSlot3]));
      }

      outputBytes = concatTypedArrays(new Uint8Array(['\n'.charCodeAt(0), outputBytes.length]), outputBytes);
      return outputBytes;
    }
  }
  else {
    throw new Error("input must be range of cells (with 7 columns).")
  }
}
