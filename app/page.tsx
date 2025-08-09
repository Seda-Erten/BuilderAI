"use client"

import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Code,
  Rocket,
  Shield,
  Users,
  CheckCircle,
  Lightbulb,
  LayoutGrid,
  TrendingUp,
  Heart,
  Crown,
  Plus,
  Menu,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Star,
  Badge,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LandingPage() {
  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 bg-black/10 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Builder Pro
                </h1>
                <p className="text-sm text-white/60">No-Code Revolution</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <a
                  href="#features"
                  className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200 flex items-center space-x-1"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Özellikler</span>
                </a>
                <a
                  href="#how-it-works"
                  className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200 flex items-center space-x-1"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Nasıl Çalışır?</span>
                </a>
                <a
                  href="#pricing"
                  className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200 flex items-center space-x-1"
                >
                  <Shield className="w-4 h-4" />
                  <span>Fiyatlar</span>
                </a>
                <a
                  href="#testimonials"
                  className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200 flex items-center space-x-1"
                >
                  <Users className="w-4 h-4" />
                  <span>Referanslar</span>
                </a>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 border border-white/20"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
                    <Plus className="w-4 h-4 mr-2" />
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                // onClick={() => setIsMenuOpen(!isMenuOpen)} // Mobile menu logic can be added here
                className="text-white hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-8"
        >
          <h2 className="text-6xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg animate-text-glow">
            Hayallerindeki Uygulamayı <br />
            <span className="inline-block mt-4">AI ile Oluştur</span>
          </h2>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 blur-xl opacity-50 animate-pulse-slow"></div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-white/80 max-w-3xl mb-10 leading-relaxed"
        >
          AI Builder Pro, yapay zeka destekli no-code platformu ile kod yazmadan, sürükle-bırak kolaylığıyla profesyonel
          web uygulamaları oluşturmanı sağlar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex space-x-4"
        >
          <Link href="/auth">
            <Button className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
              <Sparkles className="w-5 h-5 mr-2" />
              Ücretsiz Başla
            </Button>
          </Link>
          <Button
            variant="outline"
            className="px-8 py-4 text-lg text-white border-white/30 bg-white/10 hover:bg-white/20 shadow-xl hover:shadow-white/10 transition-all duration-300 transform hover:scale-105"
          >
            <Code className="w-5 h-5 mr-2" />
            Nasıl Çalışır?
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6 bg-black/20 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Güçlü Özellikler
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            AI Builder Pro ile projelerinizi bir sonraki seviyeye taşıyın.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm hover:shadow-purple-500/15 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">AI Destekli Tasarım</h4>
              <p className="text-white/70">
                İstediğiniz bileşenleri AI'ya söyleyin, anında oluşturulsun. Yaratıcılığınızın sınırlarını zorlayın.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm hover:shadow-cyan-500/15 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <LayoutGrid className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Sürükle-Bırak Editör</h4>
              <p className="text-white/70">
                Oluşturulan bileşenleri kolayca sürükleyip bırakarak arayüzünüzü istediğiniz gibi düzenleyin.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm hover:shadow-emerald-500/15 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Hızlı Prototipleme</h4>
              <p className="text-white/70">
                Fikirlerinizi saniyeler içinde gerçeğe dönüştürün. Prototipleme hiç bu kadar hızlı olmamıştı.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          >
            Nasıl Çalışır?
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            AI Builder Pro ile uygulama geliştirme süreci çok basit.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse-slow">
                <Lightbulb className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">1. Fikrini Söyle</h4>
              <p className="text-white/70">
                AI asistanına ne tür bir bileşen veya arayüz istediğini doğal dilde anlat.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="flex flex-col items-center"
            >
              <div
                className="w-24 h-24 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse-slow"
                style={{ animationDelay: "0.5s" }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">2. AI Oluştursun</h4>
              <p className="text-white/70">
                Yapay zeka, isteğine uygun bileşenleri anında oluşturup tuvale yerleştirsin.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="flex flex-col items-center"
            >
              <div
                className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse-slow"
                style={{ animationDelay: "1s" }}
              >
                <Code className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">3. İndir ve Kullan</h4>
              <p className="text-white/70">
                Oluşturduğun arayüzü React kodu olarak indir ve projenizde hemen kullanmaya başla.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="relative z-10 py-20 px-6 bg-black/20 backdrop-blur-xl border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent"
          >
            Kullanıcılarımız Ne Diyor?
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            AI Builder Pro ile başarıya ulaşanların hikayeleri.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm"
            >
              <p className="text-white/80 text-lg mb-6 italic">
                "AI Builder Pro, iş akışımı tamamen değiştirdi. Artık prototipleri saniyeler içinde oluşturabiliyorum.
                Kesinlikle tavsiye ederim!"
              </p>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src="/placeholder.svg?height=64&width=64"
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div>
                  <p className="font-semibold text-white">Ayşe Yılmaz</p>
                  <p className="text-white/60 text-sm">UX Tasarımcısı</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm"
            >
              <p className="text-white/80 text-lg mb-6 italic">
                "Kod yazmayı bilmeyen biri olarak, AI Builder Pro sayesinde kendi web sitemi kurabildim. Gerçekten
                inanılmaz bir araç!"
              </p>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src="/placeholder.svg?height=64&width=64"
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full border-2 border-cyan-500"
                />
                <div>
                  <p className="font-semibold text-white">Mehmet Demir</p>
                  <p className="text-white/60 text-sm">Girişimci</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Simplified for Landing Page) */}
      <section id="pricing" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-emerald-400 bg-clip-text text-transparent"
          >
            Fiyatlandırma
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            İhtiyaçlarınıza uygun esnek planlar.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm"
            >
              <h4 className="text-2xl font-semibold text-white mb-4">Başlangıç</h4>
              <p className="text-white/70 text-lg mb-6">Küçük projeler için ideal.</p>
              <p className="text-5xl font-bold text-white mb-6">
                Ücretsiz<span className="text-xl text-white/60">/ay</span>
              </p>
              <ul className="text-white/70 text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Temel AI Bileşenleri
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Sürükle-Bırak Editör
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Sınırlı Proje Sayısı
                </li>
              </ul>
              <Link href="/auth">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                  Ücretsiz Başla
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-8 shadow-2xl backdrop-blur-md transform scale-105 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPÜLER
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Pro</h4>
              <p className="text-white/70 text-lg mb-6">Geliştiriciler ve küçük ekipler için.</p>
              <p className="text-5xl font-bold text-white mb-6">
                $29<span className="text-xl text-white/60">/ay</span>
              </p>
              <ul className="text-white/70 text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Tüm AI Bileşenleri
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Sınırsız Proje
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Özel Destek
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Kod Export
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 shadow-xl">
                Şimdi Başla
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-sm"
            >
              <h4 className="text-2xl font-semibold text-white mb-4">Kurumsal</h4>
              <p className="text-white/70 text-lg mb-6">Büyük ekipler ve özel ihtiyaçlar için.</p>
              <p className="text-5xl font-bold text-white mb-6">
                Özel<span className="text-xl text-white/60">/teklif</span>
              </p>
              <ul className="text-white/70 text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Tüm Pro Özellikleri
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Özel Entegrasyonlar
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Öncelikli Destek
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  Eğitim ve Danışmanlık
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg">
                İletişime Geç
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-12 bg-black/20 backdrop-blur-2xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Builder Pro</h3>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Yapay zeka destekli no-code platform ile hayallerinizdeki uygulamaları dakikalar içinde oluşturun.
              </p>
              <div className="flex space-x-3">
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 p-2">
                  <Github className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 p-2">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 p-2">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 p-2">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center">
                <Rocket className="w-4 h-4 mr-2" />
                Ürün
              </h4>
              <div className="space-y-2">
                <a href="#features" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Özellikler
                </a>
                <a href="#pricing" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Fiyatlandırma
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  API Dokümantasyonu
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Şablonlar
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Entegrasyonlar
                </a>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Kaynaklar
              </h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Blog
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Topluluk
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Yardım Merkezi
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Video Eğitimler
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Webinarlar
                </a>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Şirket
              </h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Hakkımızda
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Kariyer
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  İletişim
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Gizlilik Politikası
                </a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                  Kullanım Şartları
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <span>© 2024 AI Builder Pro.</span>
              <span>Tüm hakları saklıdır.</span>
              <span className="flex items-center">
                Türkiye'de <Heart className="w-3 h-3 mx-1 text-red-500" /> ile yapıldı
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Sistem Aktif
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                v2.0.1
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
