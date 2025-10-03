"use client"

/**
 * Kullanıcı giriş-kayıt sayfası. Supabase Auth ile yapılıyor.
 * Giriş başarılı ise  /builder'a yönlendir. Kayıt başarılı ise giriş ekranına dönüş.
 */
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Loader2, Shield, Zap, ArrowRight } from "lucide-react"
import Image from "next/image"
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
        setMessage({ type: "success", text: "Kayıt başarılı! Lütfen giriş yapın." })
        setIsLogin(true) 
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden p-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-slate-900/50 to-[#0F172A]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute top-20 left-20 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-40 w-72 h-72 bg-[#F59E0B]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>

        <div className="absolute top-32 left-32 w-2 h-2 bg-[#6366F1] rounded-full animate-ping" />
        <div
          className="absolute top-60 right-40 w-1 h-1 bg-[#06B6D4] rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-60 w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-[#1E293B]/95 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-indigo-500/10">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#9dd6e0] to-[#98ddea] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Image src="/technology.png" alt="Logo" width={40} height={40} className="animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] bg-clip-text text-transparent">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </CardTitle>
          <CardDescription className="text-slate-300 mt-2 flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2 text-[#06B6D4]" />
            AI Builder'a hoş geldin!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-slate-200 flex items-center mb-2">
                <Mail className="w-4 h-4 mr-2 text-[#06B6D4]" />
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-600/50 text-[#F8FAFC] placeholder:text-slate-400 focus:bg-slate-800/70 focus:border-[#6366F1] transition-all backdrop-blur-sm"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-200 flex items-center mb-2">
                <Lock className="w-4 h-4 mr-2 text-[#06B6D4]" />
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-600/50 text-[#F8FAFC] placeholder:text-slate-400 focus:bg-slate-800/70 focus:border-[#6366F1] transition-all backdrop-blur-sm"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm backdrop-blur-sm ${
                  message.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-lg bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] hover:from-indigo-600 hover:via-cyan-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : isLogin ? (
                <User className="mr-2 h-5 w-5" />
              ) : (
                <Zap className="mr-2 h-5 w-5" />
              )}
              {loading ? "Yükleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-slate-300">
            {isLogin ? (
              <p>
                Hesabın yok mu?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsLogin(false)}
                  className="text-[#6366F1] hover:text-[#06B6D4] p-0"
                >
                  Kayıt Ol
                </Button>
              </p>
            ) : (
              <p>
                Zaten hesabın var mı?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsLogin(true)}
                  className="text-[#06B6D4] hover:text-[#6366F1] p-0"
                >
                  Giriş Yap
                </Button>
              </p>
            )}
          </div>

          <div className="mt-6 p-3 bg-gradient-to-r from-[#6366F1]/10 to-[#06B6D4]/10 border border-[#6366F1]/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center text-xs text-slate-300">
              <Shield className="w-3 h-3 mr-2 text-[#06B6D4]" />
              Güvenlikle korumalı
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
