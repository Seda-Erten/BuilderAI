/**
 * Amaç: Tailwind'in JIT derleyicisine belirli renk yardımcı sınıflarını "kullanılıyor" diye işaretleyip
 * üretmesini sağlamak. AI/özellikler paneli çalışma zamanında dinamik sınıflar üretebildiği için,
 * burada görünmez şekilde safelist ettiğimiz sınıflar globalde bir kez render edilir.
 */
import React from "react"

export function HiddenSafelist() {
  return (
    <div className="hidden" aria-hidden>
      {/* Background colors */}
      <div className="bg-pink-600 bg-purple-600 bg-fuchsia-600 bg-rose-600 bg-pink-300 bg-purple-300" />
      {/* Text colors */}
      <div className="text-pink-600 text-purple-600 text-fuchsia-600 text-rose-600" />
      {/* Border colors */}
      <div className="border border-pink-300 border-purple-300 border-fuchsia-300 border-rose-300" />
    </div>
  )
}
