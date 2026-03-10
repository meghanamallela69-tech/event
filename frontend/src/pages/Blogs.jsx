import { Link } from "react-router-dom";

const Blogs = () => {
  const posts = [
    { id: 1, title: "Planning a Modern Corporate Event", excerpt: "Craft engaging corporate experiences that attendees remember.", img: "/restaurant.jpg", category: "Corporate", date: "Apr 02, 2026" },
    { id: 2, title: "Wedding Trends 2026", excerpt: "From venues to décor, explore the latest wedding ideas.", img: "/wedding.jpg", category: "Weddings", date: "Mar 18, 2026" },
    { id: 3, title: "Choosing the Right Caterer", excerpt: "Key questions to ask and what to expect from vendors.", img: "/party.jpg", category: "Catering", date: "Mar 11, 2026" },
    { id: 4, title: "Photography That Tells a Story", excerpt: "Tips to capture moments that matter most.", img: "/anniversary.jpg", category: "Photography", date: "Feb 27, 2026" },
    { id: 5, title: "Budgeting Your Event", excerpt: "Smart ways to plan without compromising quality.", img: "/gamenight.jpg", category: "Planning", date: "Feb 10, 2026" },
    { id: 6, title: "Creating Memorable Themes", excerpt: "Theme ideas for birthdays, launches, and more.", img: "/birthday.jpg", category: "Ideas", date: "Jan 29, 2026" },
    { id: 7, title: "Outdoor Event Planning", excerpt: "Essential tips for hosting successful outdoor events.", img: "/camping.jpg", category: "Outdoor", date: "Jan 15, 2026" },
    { id: 8, title: "Live Music for Events", excerpt: "How to choose the perfect entertainment for your guests.", img: "/gamenight.jpg", category: "Entertainment", date: "Jan 05, 2026" },
  ];
  return (
    <>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 px-8 py-12">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900">Event Planning Blogs</h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Insights, guides, and tips from the EventHub team to help you plan unforgettable events.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16" style={{ backgroundColor: '#fff7ea' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px' 
        }}>
          {posts.map((p) => (
            <article key={p.id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }} className="blog-card">
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '180px',
                overflow: 'hidden'
              }}>
                <img 
                  src={p.img} 
                  alt={p.title} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#374151'
                  }}>{p.category}</span>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white'
                  }}>{p.date}</span>
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>{p.title}</h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '16px',
                  flex: 1
                }}>{p.excerpt}</p>
                <Link 
                  to="#"
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    padding: '10px 0',
                    backgroundColor: '#a2783a',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#8b6a30'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#a2783a'}
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export default Blogs;
