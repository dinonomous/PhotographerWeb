import Image from "next/image"
import { Award, Camera, Heart, Users } from "lucide-react"

export default function AboutSection() {
  const stats = [
    { icon: Camera, label: "Photos Captured", value: "10,000+" },
    { icon: Heart, label: "Happy Couples", value: "200+" },
    { icon: Users, label: "Events Covered", value: "500+" },
    { icon: Award, label: "Years Experience", value: "8+" },
  ]

  return (
    <section id="about" className="py-20 px-4 bg-[#285943]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">About Elena</h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                With over 8 years of experience in photography, I specialize in capturing the authentic emotions and
                precious moments that make each story unique. My passion lies in creating timeless images that you'll
                treasure forever.
              </p>
              <p>
                From intimate weddings to corporate events, I bring a blend of artistic vision and technical expertise
                to every shoot. My approach is natural, unobtrusive, and focused on telling your story through beautiful
                imagery.
              </p>
              <p>
                Based in the heart of the city, I'm available for local and destination photography. Let's create
                something beautiful together.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 text-gold mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=600&width=500"
                alt="Elena Rodriguez - Photographer"
                width={500}
                height={600}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-gold rounded-lg -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gold/10 rounded-lg -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
