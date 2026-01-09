import { Carousel } from 'antd';
import meeting1 from '../../../assets/images/meeting1.jpeg';
import meeting2 from '../../../assets/images/meeting2.jpeg';
import meeting3 from '../../../assets/images/meeting3.jpeg';
import meeting4 from '../../../assets/images/meeting4.jpeg';
import meeting5 from '../../../assets/images/meeting5.jpeg';

export default function ImageCarousel() {
  const slides = [
    {
      image: meeting1,
      title: 'Meet Your Team, Anywhere',
      description:
        'Bring everyone together in a secure, high-quality video meeting experience.',
    },
    {
      image: meeting2,
      title: 'Instant Meetings from Your Laptop',
      description:
        'Start or join meetings in seconds without complicated setup.',
    },
    {
      image: meeting3,
      title: 'Crystal-Clear Video Calls',
      description: 'Enjoy smooth video and audio for productive conversations.',
    },
    {
      image: meeting4,
      title: 'One-to-One Conversations',
      description:
        'Have focused discussions with simple and reliable video calls.',
    },
    {
      image: meeting5,
      title: 'Stay Connected Naturally',
      description:
        'Communicate clearly and collaborate as if you’re in the same room.',
    },
  ];

  return (
    <div className="flex justify-center w-full pt-2">
      <div className="w-full  lg:w-[45rem]">
        <Carousel
          autoplay
          autoplaySpeed={1500}
          dots
          arrows
          className="custom-carousel"
        >
          {slides.map((slide, index) => (
            <div key={index}>
              <div className="flex flex-col items-center gap-4 text-center">
                {/* Image */}
                <div className="w-60 h-60 md:w-80 md:h-80 lg:w-[26rem] lg:h-[26rem] rounded-full overflow-hidden shadow-xl">
                  <img
                    src={slide.image}
                    alt="meeting"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-blue-700">
                  {slide.title}
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 max-w-md leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
