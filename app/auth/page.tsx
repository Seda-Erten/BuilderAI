"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, User, Mail, Lock, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    let error = null
    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
    }

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      if (isLogin) {
        setMessage({ type: "success", text: "Giriş başarılı! Builder ekranına yönlendiriliyorsunuz..." })
        router.push("/builder")
      } else {
        setMessage({ type: "success", text: "Kayıt başarılı! Lütfen e-postanızı kontrol edin ve giriş yapın." })
        setIsLogin(true) // Başarılı kayıttan sonra giriş ekranına geç
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden p-4">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <Card className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </CardTitle>
          <CardDescription className="text-white/70 mt-2">AI Builder Pro'ya hoş geldin!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white/80 flex items-center mb-2">
                <Mail className="w-4 h-4 mr-2" />
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white/80 flex items-center mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-purple-500 transition-all"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : isLogin ? (
                <User className="mr-2 h-5 w-5" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {loading ? "Yükleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </Button>
          </form>

          <div className="mt-6 text-center text-white/70">
            {isLogin ? (
              <p>
                Hesabın yok mu?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsLogin(false)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Kayıt Ol
                </Button>
              </p>
            ) : (
              <p>
                Zaten hesabın var mı?{" "}
                <Button variant="link" onClick={() => setIsLogin(true)} className="text-cyan-400 hover:text-cyan-300">
                  Giriş Yap
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
