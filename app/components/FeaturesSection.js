export default function FeaturesSection() {
    return (
      <div className="py-24 sm:py-32 bg-yellow-100" data-aos="fade-up">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pomodoro Timer */}
            <FeatureCard
              imgSrc="/assets/pomodoro.png"
              title="Pomodoro Timer"
              description="Stay focused with customizable work and break intervals"
            />
            {/* Tab Tracking */}
            <FeatureCard
              imgSrc="/assets/tab-track.png"
              title="Tab Tracking"
              description="Monitor and analyze your browsing habits"
            />
            {/* WhiteList */}
            <FeatureCard
              imgSrc="/assets/list.png"
              title="WhiteList"
              description="Add websites to your whitelist to block distractions"
            />
          </div>
        </div>
      </div>
    );
  }
  
  function FeatureCard({ imgSrc, title, description }) {
    return (
      <div className="relative rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow duration-300" data-aos="zoom-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-200">
          <img src={imgSrc} alt={title} className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-yellow-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    );
  }