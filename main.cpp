#include <GLFW/glfw3.h>
#include <stdlib.h>
#include <stdio.h>
#include <fstream>
#include <string>

using std::string;

void render(float ratio)
{
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    glOrtho(-ratio, ratio, -1.f, 1.f, 1.f, -1.f);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    //glRotatef((float) glfwGetTime() * 50.f, 0.f, 0.f, 1.f);

    glBegin(GL_TRIANGLES);
    glColor3f(1.f, 1.f, 1.f);
    glVertex3f(-1.0f, -1.0f, 0.f);

    glColor3f(1.f, 1.f, 1.f);
    glVertex3f(-1.0f, 1.0f, 0.f);

    glColor3f(1.f, 1.f, 1.f);
    glVertex3f(1.f, 1.0f, 1.f);

    glColor3f(1.f, 1.f, 1.f);
    glVertex3f(1.f, 1.0f, 1.f);

    glColor3f(1.f, 1.f, 1.f);
    glVertex3f(1.f, -1.0f, 1.f);

    glColor3f(1.f, 1.f, 1.f);
    glVertex3f(-1.f, -1.0f, 1.f);
    glEnd();
}

GLuint loadShaders()
{
    GLuint shaderProgram;
    GLuint fragmentShader;

    shaderProgram  = glCreateProgram();
    fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);

    std::fstream fs;
    fs.open("main.frag", std::fstream::in);
    string fragmentShaderSource;
    string line;
    while(getline(fs, line))
    {
      fragmentShaderSource.append(line);
      fragmentShaderSource.append("\n");
    }
    fs.close();

    const char *sourceString = fragmentShaderSource.c_str();
    printf("%s", sourceString);

    glShaderSource(fragmentShader, 1, &sourceString, 0);
    glCompileShader(fragmentShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    glUseProgram(shaderProgram);

    return shaderProgram;
}

int main(int argc, char** argv)
{
    GLFWwindow *window;
    float ratio;
    int width, height;

    GLint timeLocation;
    GLint resolutionLocation;

    if (!glfwInit())
      return -1;

    window = glfwCreateWindow(800, 600, "DFields", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(window);


    GLuint shaderProgram = loadShaders();
    timeLocation = glGetUniformLocation(shaderProgram, "time");
    resolutionLocation = glGetUniformLocation(shaderProgram, "resolution");
    glUniform2f(resolutionLocation, 800.0f, 600.0f);

    float t;
    while (!glfwWindowShouldClose(window))
    {
        glfwGetFramebufferSize(window, &width, &height);
        ratio = width / (float) height;
        glViewport(0, 0, width, height);
        glClear(GL_COLOR_BUFFER_BIT);

        t = (float)glfwGetTime()*10.0f;
        glUniform1f(timeLocation, t);
        render(ratio);

        glfwSwapBuffers(window);

        glfwPollEvents();
    }

    glfwTerminate();

    return 0;
}

