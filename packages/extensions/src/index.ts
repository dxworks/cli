String.prototype.replaceBefore = function (delimiter: string, replacement?: string) {
  return (replacement || '') + this.substring(this.indexOf(delimiter))
}

String.prototype.removePrefix = function (prefix: string) {
  if (this.startsWith(prefix))
    return this.substring(prefix.length)
  else
    return this + ''
}

String.prototype.removeSuffix = function (suffix: string) {
  if (this.endsWith(suffix))
    return this.substring(0, this.length - suffix.length)
  else
    return this + ''
}

String.prototype.removeSurrounding = function (prefix: string, suffix: string) {
  if (this.startsWith(prefix) && this.endsWith(suffix))
    return this.removePrefix(prefix).removeSuffix(suffix)
  else
    return this + ''
}

Array.prototype.max = function() {
  return Math.max.apply(null, this)
}

Array.prototype.min = function() {
  return Math.min.apply(null, this)
}


export {}
