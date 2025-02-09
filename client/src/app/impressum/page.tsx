'use client'

import React from 'react';
import Header from "@/app/components/fishingquiz.de/Header";
import Footer from "@/app/components/fishingquiz.de/Footer";
import CookieBanner from "@/app/components/CookieBanner";

export default function Page() {
  return (
    <>
      <Header/>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin suscipit, sapien non mollis dignissim, quam nisi ullamcorper mi, et egestas velit ex et ante. Cras augue erat, interdum placerat venenatis non, congue eu turpis. Donec sit amet dolor dolor. Donec vel elit efficitur, aliquet nisl vel, laoreet leo. Sed sed elit eu tellus venenatis luctus non sit amet neque. Integer ac est sit amet libero faucibus fringilla. Nulla et commodo velit.

            Sed congue mauris in ante iaculis, vitae finibus risus accumsan. Aliquam fringilla magna sed mi feugiat, id ultricies tortor imperdiet. Vivamus vulputate quis urna in cursus. Donec commodo erat non lacus convallis tempor. Phasellus suscipit nulla eget mauris blandit porttitor. Integer non ex malesuada, imperdiet ex ac, laoreet ipsum. Nam in sem diam. Morbi viverra augue velit, at molestie elit molestie id. Donec pharetra vitae tellus quis rhoncus. Etiam a condimentum enim. Sed venenatis, dui in malesuada ullamcorper, erat metus bibendum purus, at congue velit ex at turpis. Morbi varius erat sit amet posuere vestibulum. Etiam sit amet gravida nunc, in vehicula quam.

            Proin fringilla quam ut elit placerat, interdum accumsan velit gravida. Suspendisse quis sem maximus, facilisis arcu id, volutpat urna. Aenean lacinia turpis a metus fermentum hendrerit. Mauris ipsum leo, bibendum faucibus faucibus eu, aliquet non lacus. Etiam id ultrices nulla, non faucibus enim. Suspendisse potenti. Suspendisse finibus sapien pellentesque dolor maximus varius.

            Nunc dapibus efficitur dolor ut sagittis. Nullam sed lacinia neque. Ut interdum egestas risus, id feugiat tortor. Morbi ac varius libero. Suspendisse potenti. Aenean vulputate arcu in risus faucibus, eu blandit massa cursus. Sed non tristique leo, id consectetur neque. Vivamus efficitur libero orci, nec consequat felis ornare a. Donec volutpat metus vitae nulla semper, convallis condimentum magna sodales. Suspendisse interdum est id augue tempus pharetra. In fermentum ipsum at porttitor euismod. Pellentesque diam leo, semper eget aliquet at, bibendum vel odio. Vivamus in sapien quis turpis scelerisque consectetur eget nec libero. Donec eget sapien vitae purus varius tempor.

            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus euismod velit ut nisl blandit, a condimentum sem fermentum. Maecenas bibendum elit sit amet rutrum auctor. Morbi nisi ligula, condimentum ut sagittis in, malesuada at nibh. In vitae accumsan mauris. Proin orci tellus, pretium sit amet auctor non, ultricies quis nisi. Nunc fermentum massa nec maximus convallis. Sed diam quam, dapibus sed eros posuere, porta laoreet ligula. Aenean at massa sapien.
          </div>
        </div>
      </div>
      <CookieBanner/>
      <Footer/>
    </>
  );
}