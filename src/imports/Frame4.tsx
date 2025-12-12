import imgImage23 from "figma:asset/b526d5d3648fbc7bea8cb5ce15a93bdbeaee7551.png";
import imgImage34 from "figma:asset/8dce48570a01e444f0c3c1b309197e54f00ef7e2.png";
import imgImage35 from "figma:asset/f7ed3a69f6985c7c2274a4ec7dab8ae30d6d440f.png";
import imgImage36 from "figma:asset/34f5dcef6cf8259d4a3fc29018f60ce82fbeb0cf.png";

export default function Frame() {
  return (
    <div className="content-stretch flex gap-[433px] items-center relative size-full">
      <div className="relative shrink-0 size-[633px]" data-name="image 23">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage23} />
      </div>
      <div className="h-[561px] relative shrink-0 w-[1559px]" data-name="image 34">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage34} />
      </div>
      <div className="h-[205px] relative shrink-0 w-[1226px]" data-name="image 35">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage35} />
      </div>
      <div className="h-[765px] relative shrink-0 w-[1740px]" data-name="image 36">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage36} />
      </div>
    </div>
  );
}