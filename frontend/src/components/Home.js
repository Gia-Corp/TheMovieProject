import React from 'react';
import {Link} from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <main>
                <section className="glass">
                    <div className="dashboard">
                        <div className="user"></div>
                    </div>
                </section>
            </main>
            <div className="circle1"></div>
            <div className="circle2"></div>
        </div>
    )
}

export default Home;