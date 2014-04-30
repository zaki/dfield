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

float hollowBox2(vec3 p)
{
    float c = 50.25+rand(p.xy);
    float scale = c*sin(time*1.2)*0.25 + 0.75;
    vec3 box = vec3(0.045*scale);
    float r  = 0.055 * scale;

    return opSub(sdSphere(p, r), sdBox(p, box));
}

float opTx(vec3 p, mat4 m)
{
    vec3 q = vec3(m * vec4(p, 0.0));
    return hollowBox(p);
}

float opU(float d1, float d2)
{
    return min(d1, d2);
}

float opBoxen(vec3 p)
{
    float off = 0.4;

    float b0 = hollowBox2(p);

    mat4 t = mat4(1.0);
    t[3] = vec4(off, 0.0, 0.0, 1.0);
    float b1 = opTx(p, t);

    t[3] = vec4(-off, 0.0, 0.0, 1.0);
    float b2 = opTx(p, t);

    t[3] = vec4(0.0, off, 0.0, 1.0);
    float b3 = opTx(p, t);

    t[3] = vec4(0.0, -off, 0.0, 1.0);
    float b4 = opTx(p, t);

    t[3] = vec4(0.0, 0.0, off, 1.0);
    float b5 = opTx(p, t);

    t[3] = vec4(0.0, 0.0, -off, 1.0);
    float b6 = opTx(p, t);

    return opU(opU(opU(opU(opU(opU(b1, b2), b3) ,b4), b5), b6), b0);
}

float opRepBox(vec3 p, vec3 c)
{
    vec3 q = mod(p, c) - 0.5 * c;
    return hollowBox(q);
}

float map(vec3 p)
{
    return opU(opRepBox(p, vec3(0.35)), opBoxen(p));
}

void main()
{
    vec2 pos = (gl_FragCoord.xy*2.0 - resolution.xy) / resolution.y;
    float x = 0.0; //sin(time/10.0) * 0.5;
    float z = 0.0; //sin(time/50.0) * turn;

    float tomg = 10.0;
    float turn = 0.5;
    float toff = 2.0;

    if (abs(sin(time / 5.0)) > 0.99)
    {
        tomg = 1.5;
        //turn = 1.0;
        //toff = 6.0;
    }
    float y = cos(time/tomg) * turn + toff;

    vec3 camPos = vec3(x,z,y);
    vec3 camDir = normalize(vec3(0.0, 0.0, -1.0));
    //camPos -=  vec3(0.0,0.0,time*0.003);
    x = sin(time/10.0) * 0.5;
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
        d = map(ray);
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

    float r = rand(ray.xy)*0.1;
    if (abs(sin(time / 5.0)) > 0.97)
    {
      r = rand(ray.xy)*0.9;
    }

    float fog = min(1.0, (1.0 / float(MAX_MARCH)) * float(march))*1.0;
    vec3  fog2 = vec3(0.05*sin(time)+0.2); //0.01 * vec3(1, 1, 1.5) * total_d;
    gl_FragColor = vec4(vec3(0.45, r, 0.45*sin(time/30.0))*fog + fog2, 1.0);
}

