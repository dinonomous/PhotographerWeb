"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Instagram, Facebook, Send, Youtube } from "lucide-react"
import LoadingSpinner from "./ui/loading-spinner"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    eventType: "",
    eventDate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: "", email: "", message: "", eventType: "", eventDate: "" })

    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="contact" className="py-20 px-4 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Let’s Create Something Beautiful
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Ready to capture your special moments? Get in touch and let’s discuss your vision.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-8">
              Get In Touch
            </h3>

            <div className="space-y-6">
              {[
                {
                  icon: <Mail className="w-6 h-6 text-gold" />,
                  label: "Email",
                  value: "varaphoting9003@gmail.com",
                },
                {
                  icon: <Phone className="w-6 h-6 text-gold" />,
                  label: "Phone",
                  value: "+91 7659 068 190",
                },
                {
                  icon: <MapPin className="w-6 h-6 text-gold" />,
                  label: "Location",
                  value: "kaverammapeta, jadcherla(M), mahabubnagar(D), 509301",
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">{label}</div>
                    <div className="text-gray-600 text-wrap w-[100%]">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h4 className="text-gray-900 font-semibold mb-4">Follow My Work</h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/vara_photing?igsh=MmxseXh0enI2Ym52"
                  className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center hover:bg-gold/30 transition-colors"
                >
                  <Instagram className="w-6 h-6 text-gold" />
                </a>
                <a href="https://youtube.com/@varaphoting?si=CVYWeG4OazunEN_l" className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center hover:bg-gold/30 transition-colors">
                  <Youtube />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { id: "name", label: "Name *", type: "text", required: true },
                  { id: "email", label: "Email *", type: "email", required: true },
                ].map(({ id, label, type, required }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-gray-900 font-semibold mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      id={id}
                      name={id}
                      value={(formData as any)[id]}
                      onChange={handleChange}
                      required={required}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:border-gold focus:ring-1 focus:ring-gold transition"
                    />
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eventType" className="block text-gray-900 font-semibold mb-2">
                    Event Type
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:border-gold focus:ring-1 focus:ring-gold transition"
                  >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="portrait">Portrait Session</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="family">Family Photos</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="eventDate" className="block text-gray-900 font-semibold mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:border-gold focus:ring-1 focus:ring-gold transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-900 font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell me about your vision..."
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:border-gold focus:ring-1 focus:ring-gold transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold-dark text-black font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {submitted && (
                <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800">
                    Thank you! Your message has been sent successfully.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
