
#ifdef GL_ES
precision mediump float;
#endif

//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
uniform float time;
uniform vec2 resolution;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float sdBox(vec3 p, vec3 b)
{
  vec3 d = abs(p) - b;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float sdSphere(vec3 p, float s)
{
    return length(p) - s;
}

float opSub(float d1, float d2)
{
    return max(-d1, d2);
}

float hollowBox(vec3 p)
{
    float c = 1.25+rand(p.xy);
    float scale = c*sin(time*1.2)*0.25 + 0.75;
    vec3 box = vec3(0.045*scale);
    float r  = 0.055 * scale;

    return opSub(sdSphere(p, r), sdBox(p, box));
}

float opRepBox(vec3 p, vec3 c, float time)
{
    vec3 q = mod(p, c) - 0.5 * c;
    return hollowBox(q);
}

float map(vec3 p, float time)
{
    return opRepBox(p, vec3(0.35), time);
}

void main()
{
    vec2 pos = (gl_FragCoord.xy*2.0 - resolution.xy) / resolution.y;
    float x = sin(time/10.0) * 0.5;
    float y = cos(time/10.0) * 3.0;
    float z = sin(time/50.0) * 5.0;
    vec3 camPos = vec3(x,z,y);
    vec3 camDir = normalize(vec3(0.3, 0.0, -1.0));
    camPos -=  vec3(0.0,0.0,time*3.0);
    vec3 camUp  = normalize(vec3(x, 1.0, 0.0));
    vec3 camSide = cross(camDir, camUp);
    float focus = 1.8;

    vec3 rayDir = normalize(camSide*pos.x + camUp*pos.y + camDir*focus);
    vec3 ray = camPos;
    int march = 0;
    float d = 0.0;

    float total_d = 0.0;
    const int MAX_MARCH = 64;
    const float MAX_DIST = 100.0;
    for(int mi=0; mi<MAX_MARCH; ++mi) {
        d = map(ray, time);
        march=mi;
        total_d += d;
        ray += rayDir * d;
        if(d<0.001) {break; }
        if(total_d>MAX_DIST) {
            total_d = MAX_DIST;
            march = MAX_MARCH-1;
            break;
        }
    }

    float fog = min(1.0, (1.0 / float(MAX_MARCH)) * float(march))*1.0;
    vec3  fog2 = 0.01 * vec3(1, 1, 1.5) * total_d;
    gl_FragColor = vec4(vec3(0.45, rand(ray.xy)*0.1, 0.45*sin(time/30.0))*fog + fog2, 1.0);
}

