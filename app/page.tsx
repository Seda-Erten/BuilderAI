"use client"

import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Shield,
  Lightbulb,
  LayoutGrid,
  Heart,
  Menu,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
  Play,
  ChevronDown,
  Globe,
  Layers,
  Brain,
  Code,
  CheckCircle,
  Zap,
  Cpu,
  Rocket,
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] relative overflow-hidden">
      {/* Background Effects - Futuristic Dark */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-slate-900/50 to-[#0F172A]" />

        {/* Futuristic Grid Pattern */}
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

        {/* AI & Tech Glowing Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#6366F1]/20 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#06B6D4]/15 via-[#F59E0B]/8 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#6366F1]/10 to-[#06B6D4]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        {/* Additional Tech Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#6366F1] rounded-full animate-ping" />
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-[#06B6D4] rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Navbar */}
      <motion.nav
        className="relative z-50 bg-[#1E293B]/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
                  AI Builder
                </h1>
                <p className="text-xs text-slate-400">Future of No-Code</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                {[
                  { href: "#features", text: "Özellikler" },
                  { href: "#how-it-works", text: "Nasıl Çalışır" },
                  { href: "#pricing", text: "Fiyatlar" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-slate-300 hover:text-[#6366F1] transition-colors font-medium hover:glow"
                  >
                    {item.text}
                  </a>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="ghost" className="text-slate-300 hover:text-[#6366F1] hover:bg-slate-800/50">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
                    Kayıt Yap
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-slate-300">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 py-20"
        style={{ y, opacity }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-[#6366F1]/20 to-[#06B6D4]/20 border border-[#6366F1]/30 rounded-full shadow-lg backdrop-blur-sm">
              <Brain className="w-4 h-4 text-[#6366F1] mr-2 animate-pulse" />
              <span className="text-[#F8FAFC] font-semibold text-sm">AI Destekli Gelecek Teknolojisi</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="block text-[#F8FAFC]">Geleceğin Web</span>
              <span className="block bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#6366F1] bg-clip-text text-transparent animate-pulse">
                Uygulamalarını Oluştur
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Yapay zeka destekli gelecek teknolojisi ile fikirlerinizi gerçeğe dönüştürün. Sürükle-bırak editör ve
              akıllı AI asistanı ile profesyonel arayüzler oluşturun.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/builder">
                <Button
                  size="lg"
                  className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Hemen Dene
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 border-slate-600 text-slate-300 bg-[#1E293B]/50 hover:bg-[#1E293B] hover:border-[#6366F1] hover:text-[#6366F1] transition-all backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2" />
                Demo İzle
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { number: "10K+", label: "Kullanıcı", color: "text-[#6366F1]", glow: "shadow-indigo-500/20" },
                { number: "50K+", label: "Proje", color: "text-[#06B6D4]", glow: "shadow-cyan-500/20" },
                { number: "99%", label: "Memnuniyet", color: "text-[#F59E0B]", glow: "shadow-amber-500/20" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center p-4 rounded-lg bg-[#1E293B]/30 backdrop-blur-sm shadow-lg ${stat.glow}`}
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 bg-[#1E293B]/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-[#F8FAFC] mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 mr-3 text-[#F59E0B]" />
              Gelecek Teknolojisi Özellikleri
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Yapay zeka destekli gelişmiş araçlarla web uygulamalarınızı oluşturun
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Destekli Tasarım",
                description: "Gelişmiş yapay zeka ile otomatik bileşen oluşturma ve akıllı tasarım önerileri",
                iconBg: "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]",
                cardBg: "bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/5",
                border: "border-[#6366F1]/30",
                glow: "shadow-indigo-500/20",
              },
              {
                icon: LayoutGrid,
                title: "Quantum Sürükle-Bırak",
                description: "Gelecek nesil görsel editör ile hızlı ve hassas prototipleme deneyimi",
                iconBg: "bg-gradient-to-r from-[#06B6D4] to-[#0891B2]",
                cardBg: "bg-gradient-to-br from-[#06B6D4]/10 to-[#0891B2]/5",
                border: "border-[#06B6D4]/30",
                glow: "shadow-cyan-500/20",
              },
              {
                icon: Code,
                title: "Premium Kod Export",
                description: "Temiz, optimize edilmiş ve production-ready React kodu ile gelişmiş çıktılar",
                iconBg: "bg-gradient-to-r from-[#F59E0B] to-[#D97706]",
                cardBg: "bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5",
                border: "border-[#F59E0B]/30",
                glow: "shadow-amber-500/20",
              },
              {
                icon: Globe,
                title: "Universal Responsive",
                description: "Tüm cihaz ve platform türlerinde pixel-perfect responsive tasarımlar",
                iconBg: "bg-gradient-to-r from-[#6366F1] to-[#06B6D4]",
                cardBg: "bg-gradient-to-br from-[#6366F1]/10 to-[#06B6D4]/5",
                border: "border-[#6366F1]/30",
                glow: "shadow-indigo-500/20",
              },
              {
                icon: Layers,
                title: "Infinite Bileşen Kütüphanesi",
                description: "Sınırsız hazır bileşenler ve şablonlar ile hızlı geliştirme süreci",
                iconBg: "bg-gradient-to-r from-[#06B6D4] to-[#6366F1]",
                cardBg: "bg-gradient-to-br from-[#06B6D4]/10 to-[#6366F1]/5",
                border: "border-[#06B6D4]/30",
                glow: "shadow-cyan-500/20",
              },
              {
                icon: Shield,
                title: "Quantum Güvenlik",
                description: "Gelecek nesil güvenlik protokolleri ile maksimum veri koruma",
                iconBg: "bg-gradient-to-r from-[#F59E0B] to-[#6366F1]",
                cardBg: "bg-gradient-to-br from-[#F59E0B]/10 to-[#6366F1]/5",
                border: "border-[#F59E0B]/30",
                glow: "shadow-amber-500/20",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`p-6 ${feature.cardBg} rounded-xl border ${feature.border} hover:shadow-lg ${feature.glow} transition-all duration-300 group backdrop-blur-sm hover:scale-105`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-[#F8FAFC] mb-4 flex items-center justify-center">
              <Cpu className="w-8 h-8 mr-3 text-[#06B6D4]" />
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              3 basit adımda geleceğin web uygulamasını oluşturun
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                icon: Lightbulb,
                title: "Vizyonunuzu Paylaşın",
                description: "AI asistanına projenizin detaylarını anlatın, o da sihirli çözümler üretsin",
                bg: "bg-gradient-to-r from-[#F59E0B] to-[#D97706]",
                cardBg: "bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/10",
                border: "border-[#F59E0B]/30",
              },
              {
                step: "2",
                icon: LayoutGrid,
                title: "Quantum Düzenleme",
                description: "Gelişmiş editör ile bileşenleri hassas şekilde konumlandırın ve özelleştirin",
                bg: "bg-gradient-to-r from-[#6366F1] to-[#06B6D4]",
                cardBg: "bg-gradient-to-br from-[#6366F1]/20 to-[#06B6D4]/10",
                border: "border-[#6366F1]/30",
              },
              {
                step: "3",
                icon: Code,
                title: "Future-Ready Kod",
                description: "Optimize edilmiş, temiz React kodunu indirin ve anında deploy edin",
                bg: "bg-gradient-to-r from-[#06B6D4] to-[#0891B2]",
                cardBg: "bg-gradient-to-br from-[#06B6D4]/20 to-[#0891B2]/10",
                border: "border-[#06B6D4]/30",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className="text-center group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <motion.div
                  className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className={`${step.cardBg} border ${step.border} rounded-lg p-6 mb-4 backdrop-blur-sm`}>
                  <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">{step.title}</h3>
                  <p className="text-slate-300">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-6 bg-[#1E293B]/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-[#F8FAFC] mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 mr-3 text-[#F59E0B]" />
              Future Fiyatlandırma
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">Geleceğin teknolojisine yatırım yapın</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Ücretsiz",
                description: "Geleceği keşfetmek için",
                features: ["5 Proje", "Temel AI Asistan", "Kod Export", "Topluluk Desteği"],
                cta: "Başla",
                popular: false,
                buttonBg: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800",
                cardBg: "bg-[#1E293B]/50",
                border: "border-slate-600/50",
                glow: "",
              },
              {
                name: "Quantum Pro",
                price: "₺199/ay",
                description: "Gelecek nesil profesyonel deneyim",
                features: [
                  "Sınırsız Proje",
                  "Advanced AI Asistan",
                  "Quantum Speed Export",
                  "Priority Support",
                  "Future Features",
                  "Team Collaboration",
                ],
                cta: "Quantum'a Geç",
                popular: true,
                buttonBg: "bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600",
                cardBg: "bg-gradient-to-br from-[#6366F1]/20 to-[#06B6D4]/10",
                border: "border-[#6366F1]/50",
                glow: "shadow-indigo-500/25",
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`p-8 rounded-2xl border ${plan.border} ${plan.cardBg} transition-all duration-300 backdrop-blur-sm ${
                  plan.popular ? `shadow-xl scale-105 ${plan.glow}` : "hover:shadow-lg"
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center justify-center w-fit mx-auto">
                      <Zap className="w-3 h-3 mr-1" />
                      EN POPÜLER
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2 text-[#F8FAFC]">{plan.name}</h3>
                  <p className="mb-4 text-slate-300">{plan.description}</p>
                  <div className="text-3xl font-bold text-[#F8FAFC]">{plan.price}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 text-[#06B6D4]" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className={`w-full ${plan.buttonBg} text-white hover:shadow-lg transition-all`}>
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-lg">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">AI Builder</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Geleceğin no-code platformu ile yapay zeka destekli web uygulamaları oluşturun.
              </p>
              <div className="flex space-x-4">
                {[Github, Twitter, Linkedin, Mail].map((Icon, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-[#6366F1] hover:bg-slate-800/50 p-2"
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-[#F8FAFC]">Ürün</h4>
              <div className="space-y-2">
                {["Future Özellikler", "Fiyatlandırma", "Dokümantasyon"].map((link) => (
                  <a key={link} href="#" className="block text-slate-400 hover:text-[#6366F1] text-sm">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-[#F8FAFC]">Destek</h4>
              <div className="space-y-2">
                {["Yardım Merkezi", "İletişim", "Quantum Topluluk"].map((link) => (
                  <a key={link} href="#" className="block text-slate-400 hover:text-[#06B6D4] text-sm">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-[#F8FAFC]">Yasal</h4>
              <div className="space-y-2">
                {["Gizlilik", "Şartlar", "Çerezler"].map((link) => (
                  <a key={link} href="#" className="block text-slate-400 hover:text-[#F59E0B] text-sm">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">© 2024 AI Builder Future. Tüm hakları saklıdır.</div>
            <div className="flex items-center text-slate-400 text-sm">
              Türkiye'de <Heart className="w-4 h-4 mx-1 text-red-500" /> ve AI ile yapıldı
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
